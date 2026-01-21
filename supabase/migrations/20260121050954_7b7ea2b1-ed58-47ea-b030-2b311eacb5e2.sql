-- Create enum for PII masking levels
CREATE TYPE public.pii_masking_level AS ENUM ('none', 'optional', 'enforced');

-- Create enum for plan types
CREATE TYPE public.plan_type AS ENUM ('anonymous', 'registered_free', 'pro', 'business', 'lifetime');

-- Plans table (reference data)
CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name public.plan_type NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  daily_page_limit INTEGER, -- NULL means unlimited
  pii_masking public.pii_masking_level NOT NULL DEFAULT 'none',
  price_cents INTEGER NOT NULL DEFAULT 0,
  is_recurring BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default plans
INSERT INTO public.plans (name, display_name, daily_page_limit, pii_masking, price_cents, is_recurring) VALUES
  ('anonymous', 'Anonymous', 1, 'none', 0, false),
  ('registered_free', 'Registered (Free)', 5, 'none', 0, false),
  ('pro', 'Pro', NULL, 'optional', 1900, true),
  ('business', 'Business', NULL, 'enforced', 4900, true),
  ('lifetime', 'Lifetime', NULL, 'enforced', 11900, false);

-- Enable RLS on plans (publicly readable)
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Plans are publicly readable"
  ON public.plans FOR SELECT
  USING (true);

-- Lifetime spots tracking (singleton table)
CREATE TABLE public.lifetime_spots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_spots INTEGER NOT NULL DEFAULT 350,
  sold_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_sold_count CHECK (sold_count >= 0 AND sold_count <= total_spots)
);

-- Insert the initial lifetime spots record
INSERT INTO public.lifetime_spots (total_spots, sold_count) VALUES (350, 0);

-- Enable RLS (publicly readable)
ALTER TABLE public.lifetime_spots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lifetime spots are publicly readable"
  ON public.lifetime_spots FOR SELECT
  USING (true);

-- User subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.plans(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast user lookups
CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON public.user_subscriptions(status);

-- Enable RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Usage tracking table (supports both authenticated and anonymous users)
CREATE TABLE public.usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_fingerprint TEXT,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  pages_processed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT at_least_one_identifier CHECK (user_id IS NOT NULL OR session_fingerprint IS NOT NULL)
);

-- Unique constraint to prevent duplicate entries per day
CREATE UNIQUE INDEX idx_usage_user_date ON public.usage_tracking(user_id, usage_date) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX idx_usage_session_date ON public.usage_tracking(session_fingerprint, usage_date) WHERE session_fingerprint IS NOT NULL;

-- Enable RLS
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view/manage their own usage
CREATE POLICY "Users can view their own usage"
  ON public.usage_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage"
  ON public.usage_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage"
  ON public.usage_tracking FOR UPDATE
  USING (auth.uid() = user_id);

-- Anonymous usage policies (via service role only - handled by edge function)

-- Helper function: Get user's current plan
CREATE OR REPLACE FUNCTION public.get_user_plan(p_user_id UUID DEFAULT NULL)
RETURNS TABLE(
  plan_name public.plan_type,
  display_name TEXT,
  daily_limit INTEGER,
  pii_masking public.pii_masking_level
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If no user_id, return anonymous plan
  IF p_user_id IS NULL THEN
    RETURN QUERY
    SELECT p.name, p.display_name, p.daily_page_limit, p.pii_masking
    FROM plans p
    WHERE p.name = 'anonymous';
    RETURN;
  END IF;

  -- Check for active subscription
  RETURN QUERY
  SELECT p.name, p.display_name, p.daily_page_limit, p.pii_masking
  FROM user_subscriptions us
  JOIN plans p ON us.plan_id = p.id
  WHERE us.user_id = p_user_id
    AND us.status = 'active'
    AND (us.expires_at IS NULL OR us.expires_at > now())
  ORDER BY p.price_cents DESC
  LIMIT 1;
  
  -- If no rows returned, return registered_free
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT p.name, p.display_name, p.daily_page_limit, p.pii_masking
    FROM plans p
    WHERE p.name = 'registered_free';
  END IF;
END;
$$;

-- Helper function: Get remaining pages for today
CREATE OR REPLACE FUNCTION public.get_remaining_pages(
  p_user_id UUID DEFAULT NULL,
  p_session_fingerprint TEXT DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_daily_limit INTEGER;
  v_pages_used INTEGER;
BEGIN
  -- Get the user's daily limit
  SELECT daily_limit INTO v_daily_limit
  FROM get_user_plan(p_user_id);
  
  -- NULL limit means unlimited
  IF v_daily_limit IS NULL THEN
    RETURN -1; -- -1 indicates unlimited
  END IF;
  
  -- Get pages used today
  SELECT COALESCE(pages_processed, 0) INTO v_pages_used
  FROM usage_tracking
  WHERE usage_date = CURRENT_DATE
    AND (
      (p_user_id IS NOT NULL AND user_id = p_user_id)
      OR (p_session_fingerprint IS NOT NULL AND session_fingerprint = p_session_fingerprint)
    );
  
  IF v_pages_used IS NULL THEN
    v_pages_used := 0;
  END IF;
  
  RETURN GREATEST(0, v_daily_limit - v_pages_used);
END;
$$;

-- Helper function: Check if lifetime spots available
CREATE OR REPLACE FUNCTION public.get_lifetime_spots_remaining()
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT total_spots - sold_count FROM lifetime_spots LIMIT 1;
$$;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_usage_tracking_updated_at
  BEFORE UPDATE ON public.usage_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lifetime_spots_updated_at
  BEFORE UPDATE ON public.lifetime_spots
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();