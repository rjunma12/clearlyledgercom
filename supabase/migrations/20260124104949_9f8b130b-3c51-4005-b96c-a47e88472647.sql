-- Drop and recreate get_user_plan function with allowed_formats
DROP FUNCTION IF EXISTS public.get_user_plan(uuid);

CREATE FUNCTION public.get_user_plan(p_user_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(plan_name plan_type, display_name text, daily_limit integer, monthly_limit integer, pii_masking pii_masking_level, allowed_formats text[])
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
    SELECT p.name, p.display_name, p.daily_page_limit, p.monthly_page_limit, p.pii_masking, p.allowed_formats
    FROM plans p
    WHERE p.name = 'anonymous';
    RETURN;
  END IF;

  -- Check for active subscription
  RETURN QUERY
  SELECT p.name, p.display_name, p.daily_page_limit, p.monthly_page_limit, p.pii_masking, p.allowed_formats
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
    SELECT p.name, p.display_name, p.daily_page_limit, p.monthly_page_limit, p.pii_masking, p.allowed_formats
    FROM plans p
    WHERE p.name = 'registered_free';
  END IF;
END;
$function$;