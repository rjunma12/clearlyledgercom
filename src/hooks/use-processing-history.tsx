import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ProcessingHistoryItem {
  id: string;
  fileName: string;
  fileSizeBytes: number | null;
  pagesProcessed: number;
  status: 'processing' | 'completed' | 'failed';
  exportType: 'masked' | 'full' | null;
  transactionsExtracted: number | null;
  validationErrors: number;
  createdAt: Date;
  completedAt: Date | null;
}

export interface UserStats {
  totalFilesProcessed: number;
  totalPagesProcessed: number;
  totalTransactionsExtracted: number;
  filesThisMonth: number;
  pagesThisMonth: number;
}

interface UseProcessingHistoryReturn {
  history: ProcessingHistoryItem[];
  stats: UserStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addHistoryItem: (item: Omit<ProcessingHistoryItem, 'id' | 'createdAt'>) => Promise<boolean>;
}

export function useProcessingHistory(): UseProcessingHistoryReturn {
  const [history, setHistory] = useState<ProcessingHistoryItem[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setHistory([]);
        setStats(null);
        setIsLoading(false);
        return;
      }

      // Fetch history
      const { data: historyData, error: historyError } = await supabase
        .from('processing_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (historyError) {
        throw historyError;
      }

      const mappedHistory: ProcessingHistoryItem[] = (historyData || []).map(item => ({
        id: item.id,
        fileName: item.file_name,
        fileSizeBytes: item.file_size_bytes,
        pagesProcessed: item.pages_processed,
        status: item.status as 'processing' | 'completed' | 'failed',
        exportType: item.export_type as 'masked' | 'full' | null,
        transactionsExtracted: item.transactions_extracted,
        validationErrors: item.validation_errors || 0,
        createdAt: new Date(item.created_at),
        completedAt: item.completed_at ? new Date(item.completed_at) : null,
      }));

      setHistory(mappedHistory);

      // Fetch stats
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_user_stats', { p_user_id: user.id });

      if (statsError) {
        console.error('Error fetching stats:', statsError);
      } else if (statsData && statsData.length > 0) {
        const s = statsData[0];
        setStats({
          totalFilesProcessed: Number(s.total_files_processed) || 0,
          totalPagesProcessed: Number(s.total_pages_processed) || 0,
          totalTransactionsExtracted: Number(s.total_transactions_extracted) || 0,
          filesThisMonth: Number(s.files_this_month) || 0,
          pagesThisMonth: Number(s.pages_this_month) || 0,
        });
      }

    } catch (err) {
      console.error('Error fetching processing history:', err);
      setError('Failed to load processing history');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addHistoryItem = useCallback(async (
    item: Omit<ProcessingHistoryItem, 'id' | 'createdAt'>
  ): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return false;
      }

      const { error } = await supabase
        .from('processing_history')
        .insert({
          user_id: user.id,
          file_name: item.fileName,
          file_size_bytes: item.fileSizeBytes,
          pages_processed: item.pagesProcessed,
          status: item.status,
          export_type: item.exportType,
          transactions_extracted: item.transactionsExtracted,
          validation_errors: item.validationErrors,
          completed_at: item.completedAt?.toISOString(),
        });

      if (error) {
        console.error('Error adding history item:', error);
        return false;
      }

      await fetchData();
      return true;
    } catch (err) {
      console.error('Error adding history item:', err);
      return false;
    }
  }, [fetchData]);

  useEffect(() => {
    fetchData();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchData();
    });

    return () => subscription.unsubscribe();
  }, [fetchData]);

  return {
    history,
    stats,
    isLoading,
    error,
    refetch: fetchData,
    addHistoryItem,
  };
}
