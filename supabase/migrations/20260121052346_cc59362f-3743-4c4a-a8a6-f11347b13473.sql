-- Email notification preferences table
CREATE TABLE public.email_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT NOT NULL,
  usage_alerts BOOLEAN NOT NULL DEFAULT true,
  feature_announcements BOOLEAN NOT NULL DEFAULT true,
  marketing BOOLEAN NOT NULL DEFAULT false,
  last_usage_alert_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for lookups
CREATE INDEX idx_email_preferences_user_id ON public.email_preferences(user_id);

-- Enable RLS
ALTER TABLE public.email_preferences ENABLE ROW LEVEL SECURITY;

-- Users can manage their own preferences
CREATE POLICY "Users can view their own email preferences"
  ON public.email_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own email preferences"
  ON public.email_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email preferences"
  ON public.email_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Feature announcements table (admin managed)
CREATE TABLE public.feature_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_plans TEXT[] NOT NULL DEFAULT ARRAY['lifetime', 'business', 'pro'],
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS (publicly readable for display purposes)
ALTER TABLE public.feature_announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Announcements are publicly readable"
  ON public.feature_announcements FOR SELECT
  USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_email_preferences_updated_at
  BEFORE UPDATE ON public.email_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to get users eligible for usage alerts (at 80%+ usage)
CREATE OR REPLACE FUNCTION public.get_users_needing_usage_alert()
RETURNS TABLE(
  user_id UUID,
  email TEXT,
  pages_used INTEGER,
  daily_limit INTEGER,
  percent_used INTEGER
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ut.user_id,
    ep.email,
    ut.pages_processed as pages_used,
    p.daily_page_limit as daily_limit,
    CASE WHEN p.daily_page_limit > 0 
      THEN ROUND((ut.pages_processed::DECIMAL / p.daily_page_limit) * 100)::INTEGER
      ELSE 0
    END as percent_used
  FROM usage_tracking ut
  JOIN email_preferences ep ON ut.user_id = ep.user_id
  JOIN user_subscriptions us ON ut.user_id = us.user_id AND us.status = 'active'
  JOIN plans p ON us.plan_id = p.id
  WHERE ut.usage_date = CURRENT_DATE
    AND ut.user_id IS NOT NULL
    AND ep.usage_alerts = true
    AND p.daily_page_limit IS NOT NULL
    AND p.daily_page_limit > 0
    AND (ut.pages_processed::DECIMAL / p.daily_page_limit) >= 0.8
    AND (ep.last_usage_alert_at IS NULL OR ep.last_usage_alert_at::DATE < CURRENT_DATE);
$$;

-- Function to get lifetime members for announcements
CREATE OR REPLACE FUNCTION public.get_lifetime_members_for_announcement()
RETURNS TABLE(
  user_id UUID,
  email TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    us.user_id,
    ep.email
  FROM user_subscriptions us
  JOIN plans p ON us.plan_id = p.id
  JOIN email_preferences ep ON us.user_id = ep.user_id
  WHERE p.name = 'lifetime'
    AND us.status = 'active'
    AND ep.feature_announcements = true;
$$;