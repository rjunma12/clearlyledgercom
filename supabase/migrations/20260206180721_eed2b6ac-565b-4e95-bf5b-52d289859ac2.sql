-- Fix 1: Update error_logs SELECT policy to remove anonymous access
DROP POLICY IF EXISTS "Users can view own errors" ON public.error_logs;
CREATE POLICY "Users can view own errors" 
  ON public.error_logs FOR SELECT 
  USING (auth.uid() = user_id);

-- Fix 2: Update error_logs INSERT policy to be more restrictive (allow both authenticated and anonymous logging)
DROP POLICY IF EXISTS "Allow insert for all" ON public.error_logs;
CREATE POLICY "Allow anonymous error inserts" 
  ON public.error_logs FOR INSERT 
  WITH CHECK (
    -- Allow authenticated users to log their own errors
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR
    -- Allow anonymous error logging (user_id must be NULL for anonymous)
    (auth.uid() IS NULL AND user_id IS NULL)
  );

-- Fix 3: Recreate user_subscriptions_public view with SECURITY INVOKER
DROP VIEW IF EXISTS public.user_subscriptions_public;
CREATE VIEW public.user_subscriptions_public
WITH (security_invoker=on) AS
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

-- Note: Views with security_invoker inherit RLS from base table, 
-- so user_subscriptions RLS policy will apply