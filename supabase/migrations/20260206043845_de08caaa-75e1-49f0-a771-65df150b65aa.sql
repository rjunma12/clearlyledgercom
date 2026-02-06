-- ============================================
-- Migration: Remove Dodo-specific columns and add provider-agnostic columns
-- ============================================

-- 1. Add provider-agnostic columns to payment_events
ALTER TABLE public.payment_events
ADD COLUMN IF NOT EXISTS provider_payment_id TEXT,
ADD COLUMN IF NOT EXISTS provider_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS provider_customer_id TEXT,
ADD COLUMN IF NOT EXISTS provider_name TEXT;

-- 2. Copy existing dodo data to new columns before dropping
UPDATE public.payment_events 
SET 
  provider_payment_id = dodo_payment_id,
  provider_subscription_id = dodo_subscription_id,
  provider_customer_id = dodo_customer_id,
  provider_name = 'dodo'
WHERE dodo_payment_id IS NOT NULL OR dodo_subscription_id IS NOT NULL OR dodo_customer_id IS NOT NULL;

-- 3. Drop Dodo-specific columns from payment_events
ALTER TABLE public.payment_events
DROP COLUMN IF EXISTS dodo_payment_id,
DROP COLUMN IF EXISTS dodo_subscription_id,
DROP COLUMN IF EXISTS dodo_customer_id;

-- 4. Add provider-agnostic columns to user_subscriptions
ALTER TABLE public.user_subscriptions
ADD COLUMN IF NOT EXISTS provider_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS provider_payment_id TEXT,
ADD COLUMN IF NOT EXISTS provider_customer_id TEXT,
ADD COLUMN IF NOT EXISTS provider_name TEXT;

-- 5. Copy existing dodo data to new columns before dropping
UPDATE public.user_subscriptions 
SET 
  provider_subscription_id = dodo_subscription_id,
  provider_payment_id = dodo_payment_id,
  provider_customer_id = dodo_customer_id,
  provider_name = 'dodo'
WHERE dodo_subscription_id IS NOT NULL OR dodo_payment_id IS NOT NULL OR dodo_customer_id IS NOT NULL;

-- 6. Drop Dodo-specific columns from user_subscriptions
ALTER TABLE public.user_subscriptions
DROP COLUMN IF EXISTS dodo_subscription_id,
DROP COLUMN IF EXISTS dodo_payment_id,
DROP COLUMN IF EXISTS dodo_customer_id;

-- 7. Add provider-agnostic columns to plans
ALTER TABLE public.plans
ADD COLUMN IF NOT EXISTS provider_product_id TEXT,
ADD COLUMN IF NOT EXISTS provider_price_id TEXT;

-- 8. Copy existing dodo product IDs to new column
UPDATE public.plans 
SET provider_product_id = dodo_product_id
WHERE dodo_product_id IS NOT NULL;

-- 9. Drop Dodo-specific column from plans
ALTER TABLE public.plans
DROP COLUMN IF EXISTS dodo_product_id;

-- 10. Update the user_subscriptions_public view to remove dodo columns
DROP VIEW IF EXISTS public.user_subscriptions_public;

CREATE VIEW public.user_subscriptions_public AS
SELECT 
  id,
  user_id,
  plan_id,
  status,
  started_at,
  expires_at,
  cancel_at_period_end,
  cancelled_at,
  billing_interval,
  provider_name,
  created_at,
  updated_at
FROM public.user_subscriptions;

-- 11. Grant access to the view
GRANT SELECT ON public.user_subscriptions_public TO authenticated;
GRANT SELECT ON public.user_subscriptions_public TO anon;