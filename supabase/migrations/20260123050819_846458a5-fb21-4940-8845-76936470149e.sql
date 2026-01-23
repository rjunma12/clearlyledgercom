-- Drop existing functions that need signature changes
DROP FUNCTION IF EXISTS public.get_user_plan(uuid);

-- Recreate get_user_plan with monthly_limit support
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

-- Update get_remaining_pages to check both daily and monthly limits
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