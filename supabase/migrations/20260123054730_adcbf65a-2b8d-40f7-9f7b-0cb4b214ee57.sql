-- Create a sanitized view for user_subscriptions that hides payment provider IDs
CREATE VIEW public.user_subscriptions_public
WITH (security_invoker = on) AS
SELECT 
  id,
  user_id,
  plan_id,
  status,
  started_at,
  expires_at,
  cancel_at_period_end,
  cancelled_at,
  created_at,
  updated_at
FROM public.user_subscriptions;
-- Note: Excludes dodo_subscription_id, dodo_payment_id, dodo_customer_id

-- Add RLS policy to view (views inherit from base table with security_invoker)
-- The existing "Users can view their own subscriptions" policy on the base table
-- will apply to the view as well

-- Add comment for documentation
COMMENT ON VIEW public.user_subscriptions_public IS 'Sanitized view of user_subscriptions that hides internal payment provider IDs for client access';