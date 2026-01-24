-- Fix 1: Add authorization checks to SECURITY DEFINER functions

-- Drop and recreate get_user_plan with auth check
CREATE OR REPLACE FUNCTION public.get_user_plan(p_user_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(plan_name plan_type, display_name text, daily_limit integer, monthly_limit integer, pii_masking pii_masking_level)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Authorization check: only allow querying own data or NULL for anonymous
  IF p_user_id IS NOT NULL AND p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: cannot query other user plans';
  END IF;

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

-- Drop and recreate get_remaining_pages with auth check
CREATE OR REPLACE FUNCTION public.get_remaining_pages(p_user_id uuid DEFAULT NULL::uuid, p_session_fingerprint text DEFAULT NULL::text)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_daily_limit INTEGER;
  v_monthly_limit INTEGER;
  v_pages_used_today INTEGER;
  v_pages_used_month INTEGER;
  v_daily_remaining INTEGER;
  v_monthly_remaining INTEGER;
BEGIN
  -- Authorization check: only allow querying own data
  IF p_user_id IS NOT NULL AND p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: cannot query other user usage';
  END IF;

  -- Get the user's limits
  SELECT daily_limit, monthly_limit INTO v_daily_limit, v_monthly_limit
  FROM get_user_plan(p_user_id);
  
  -- If both limits are NULL, user has unlimited access
  IF v_daily_limit IS NULL AND v_monthly_limit IS NULL THEN
    RETURN -1; -- -1 indicates unlimited
  END IF;
  
  -- Get pages used today
  SELECT COALESCE(SUM(pages_processed), 0) INTO v_pages_used_today
  FROM usage_tracking
  WHERE usage_date = CURRENT_DATE
    AND (
      (p_user_id IS NOT NULL AND user_id = p_user_id)
      OR (p_session_fingerprint IS NOT NULL AND session_fingerprint = p_session_fingerprint)
    );
  
  -- Get pages used this month
  SELECT COALESCE(SUM(pages_processed), 0) INTO v_pages_used_month
  FROM usage_tracking
  WHERE usage_date >= date_trunc('month', CURRENT_DATE)::DATE
    AND (
      (p_user_id IS NOT NULL AND user_id = p_user_id)
      OR (p_session_fingerprint IS NOT NULL AND session_fingerprint = p_session_fingerprint)
    );
  
  -- Calculate remaining for each limit type
  IF v_daily_limit IS NOT NULL THEN
    v_daily_remaining := GREATEST(0, v_daily_limit - v_pages_used_today);
  ELSE
    v_daily_remaining := 999999; -- No daily limit
  END IF;
  
  IF v_monthly_limit IS NOT NULL THEN
    v_monthly_remaining := GREATEST(0, v_monthly_limit - v_pages_used_month);
  ELSE
    v_monthly_remaining := 999999; -- No monthly limit
  END IF;
  
  -- Return the more restrictive limit
  RETURN LEAST(v_daily_remaining, v_monthly_remaining);
END;
$function$;

-- Drop and recreate get_user_stats with auth check
CREATE OR REPLACE FUNCTION public.get_user_stats(p_user_id uuid)
 RETURNS TABLE(total_files_processed bigint, total_pages_processed bigint, total_transactions_extracted bigint, files_this_month bigint, pages_this_month bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Authorization check: only allow querying own data
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: cannot query other user stats';
  END IF;

  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_files_processed,
    COALESCE(SUM(pages_processed), 0)::BIGINT as total_pages_processed,
    COALESCE(SUM(transactions_extracted), 0)::BIGINT as total_transactions_extracted,
    COUNT(*) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE))::BIGINT as files_this_month,
    COALESCE(SUM(pages_processed) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE)), 0)::BIGINT as pages_this_month
  FROM processing_history
  WHERE user_id = p_user_id AND status = 'completed';
END;
$function$;

-- Fix 2: Ensure email_preferences has proper RLS (already has it, but verify no public grants)
-- RLS is already enabled on email_preferences with proper policies

-- Fix 3: Add explicit deny policies for payment_events to prevent unauthorized writes
-- These are already blocked at RLS level (no INSERT/UPDATE/DELETE policies exist)
-- But let's add explicit deny policies to be extra safe

-- Explicit deny for INSERT (only service role should insert via webhooks)
CREATE POLICY "Deny all inserts to payment_events"
ON public.payment_events
FOR INSERT
TO authenticated
WITH CHECK (false);

-- Explicit deny for UPDATE 
CREATE POLICY "Deny all updates to payment_events"
ON public.payment_events
FOR UPDATE
TO authenticated
USING (false);

-- Explicit deny for DELETE
CREATE POLICY "Deny all deletes from payment_events"
ON public.payment_events
FOR DELETE
TO authenticated
USING (false);

-- Fix 4: Recreate user_subscriptions_public view with security_barrier
DROP VIEW IF EXISTS public.user_subscriptions_public;

CREATE VIEW public.user_subscriptions_public
WITH (security_invoker = on, security_barrier = true) AS
SELECT 
  id,
  user_id,
  plan_id,
  status,
  started_at,
  expires_at,
  created_at,
  updated_at,
  cancelled_at,
  cancel_at_period_end
FROM public.user_subscriptions;