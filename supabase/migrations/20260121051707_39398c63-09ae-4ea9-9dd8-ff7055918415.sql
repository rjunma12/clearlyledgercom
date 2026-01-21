-- Processing history table
CREATE TABLE public.processing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size_bytes INTEGER,
  pages_processed INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('processing', 'completed', 'failed')),
  export_type TEXT CHECK (export_type IN ('masked', 'full')),
  transactions_extracted INTEGER,
  validation_errors INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Index for fast user lookups
CREATE INDEX idx_processing_history_user_id ON public.processing_history(user_id);
CREATE INDEX idx_processing_history_created_at ON public.processing_history(created_at DESC);

-- Enable RLS
ALTER TABLE public.processing_history ENABLE ROW LEVEL SECURITY;

-- Users can only see their own history
CREATE POLICY "Users can view their own processing history"
  ON public.processing_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own processing history"
  ON public.processing_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Helper function to get user stats
CREATE OR REPLACE FUNCTION public.get_user_stats(p_user_id UUID)
RETURNS TABLE(
  total_files_processed BIGINT,
  total_pages_processed BIGINT,
  total_transactions_extracted BIGINT,
  files_this_month BIGINT,
  pages_this_month BIGINT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COUNT(*)::BIGINT as total_files_processed,
    COALESCE(SUM(pages_processed), 0)::BIGINT as total_pages_processed,
    COALESCE(SUM(transactions_extracted), 0)::BIGINT as total_transactions_extracted,
    COUNT(*) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE))::BIGINT as files_this_month,
    COALESCE(SUM(pages_processed) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE)), 0)::BIGINT as pages_this_month
  FROM processing_history
  WHERE user_id = p_user_id AND status = 'completed';
$$;