import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EmailPreferences {
  usageAlerts: boolean;
  featureAnnouncements: boolean;
  marketing: boolean;
}

interface UseEmailPreferencesReturn {
  preferences: EmailPreferences | null;
  isLoading: boolean;
  error: string | null;
  updatePreferences: (prefs: Partial<EmailPreferences>) => Promise<boolean>;
  initializePreferences: (email: string) => Promise<boolean>;
}

export function useEmailPreferences(): UseEmailPreferencesReturn {
  const [preferences, setPreferences] = useState<EmailPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setPreferences(null);
        setIsLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('email_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (data) {
        setPreferences({
          usageAlerts: data.usage_alerts,
          featureAnnouncements: data.feature_announcements,
          marketing: data.marketing,
        });
      } else {
        // No preferences yet - will be created on first update
        setPreferences({
          usageAlerts: true,
          featureAnnouncements: true,
          marketing: false,
        });
      }

    } catch (err: any) {
      console.error('Error fetching email preferences:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const initializePreferences = useCallback(async (email: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return false;

      // Check if preferences exist
      const { data: existing } = await supabase
        .from('email_preferences')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) return true;

      // Create default preferences
      const { error } = await supabase
        .from('email_preferences')
        .insert({
          user_id: user.id,
          email,
          usage_alerts: true,
          feature_announcements: true,
          marketing: false,
        });

      if (error) {
        console.error('Error creating email preferences:', error);
        return false;
      }

      await fetchPreferences();
      return true;
    } catch (err) {
      console.error('Error initializing preferences:', err);
      return false;
    }
  }, [fetchPreferences]);

  const updatePreferences = useCallback(async (prefs: Partial<EmailPreferences>): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return false;

      const updateData: Record<string, boolean> = {};
      if (prefs.usageAlerts !== undefined) updateData.usage_alerts = prefs.usageAlerts;
      if (prefs.featureAnnouncements !== undefined) updateData.feature_announcements = prefs.featureAnnouncements;
      if (prefs.marketing !== undefined) updateData.marketing = prefs.marketing;

      const { error } = await supabase
        .from('email_preferences')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating preferences:', error);
        return false;
      }

      setPreferences(prev => prev ? { ...prev, ...prefs } : null);
      return true;
    } catch (err) {
      console.error('Error updating preferences:', err);
      return false;
    }
  }, []);

  useEffect(() => {
    fetchPreferences();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchPreferences();
    });

    return () => subscription.unsubscribe();
  }, [fetchPreferences]);

  return {
    preferences,
    isLoading,
    error,
    updatePreferences,
    initializePreferences,
  };
}
