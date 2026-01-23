-- Add monthly_page_limit column to plans (if not exists)
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS monthly_page_limit INTEGER;

-- Add Dodo product ID mapping to plans
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS dodo_product_id TEXT;

-- Update plan limits and add Dodo product IDs
UPDATE public.plans SET 
  monthly_page_limit = 400,
  daily_page_limit = NULL,
  price_cents = 1500,
  dodo_product_id = 'pdt_starter_monthly'
WHERE name = 'starter';

UPDATE public.plans SET 
  monthly_page_limit = 1000,
  daily_page_limit = NULL,
  price_cents = 3000,
  dodo_product_id = 'pdt_pro_monthly'
WHERE name = 'pro';

UPDATE public.plans SET 
  monthly_page_limit = 4000,
  daily_page_limit = NULL,
  price_cents = 5000,
  dodo_product_id = 'pdt_business_monthly'
WHERE name = 'business';

UPDATE public.plans SET 
  monthly_page_limit = 500,
  daily_page_limit = NULL,
  price_cents = 11900,
  is_recurring = false,
  dodo_product_id = 'pdt_lifetime_onetime'
WHERE name = 'lifetime';

-- Ensure lifetime_spots has correct total
UPDATE public.lifetime_spots SET total_spots = 350 WHERE total_spots != 350;

-- Enhance user_subscriptions table with Dodo tracking
ALTER TABLE public.user_subscriptions 
  ADD COLUMN IF NOT EXISTS dodo_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS dodo_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS dodo_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT false;

-- Create indexes for faster Dodo lookups
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_dodo_subscription_id 
  ON public.user_subscriptions(dodo_subscription_id);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_dodo_customer_id 
  ON public.user_subscriptions(dodo_customer_id);

-- Create payment_events table for audit trail
CREATE TABLE IF NOT EXISTS public.payment_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  dodo_payment_id TEXT,
  dodo_subscription_id TEXT,
  dodo_customer_id TEXT,
  amount_cents INTEGER,
  currency TEXT DEFAULT 'USD',
  status TEXT,
  plan_name TEXT,
  raw_payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on payment_events
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

-- Users can only view their own payment events
CREATE POLICY "Users can view their own payment events"
  ON public.payment_events
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create indexes for payment event lookups
CREATE INDEX IF NOT EXISTS idx_payment_events_user_id ON public.payment_events(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_dodo_payment_id ON public.payment_events(dodo_payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_event_type ON public.payment_events(event_type);

-- Update get_user_plan function to return monthly_limit
CREATE OR REPLACE FUNCTION public.get_user_plan(p_user_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(plan_name plan_type, display_name text, daily_limit integer, monthly_limit integer, pii_masking pii_masking_level)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- If no user_id, return anonymous plan
  IF p_user_id IS NULL THEN
    RETURN QUERY
    SELECT p.name, p.display_name, p.daily_page_limit, p.monthly_page_limit, p.pii_masking
    FROM plans p
    WHERE p.name = 'anonymous';
    RETURN;
  END IF;

  -- Check for active subscription
  RETURN QUERY
  SELECT p.name, p.display_name, p.daily_page_limit, p.monthly_page_limit, p.pii_masking
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
    SELECT p.name, p.display_name, p.daily_page_limit, p.monthly_page_limit, p.pii_masking
    FROM plans p
    WHERE p.name = 'registered_free';
  END IF;
END;
$function$;