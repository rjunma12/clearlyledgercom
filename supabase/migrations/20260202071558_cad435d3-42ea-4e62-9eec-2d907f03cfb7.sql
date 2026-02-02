-- Step 2: Insert annual plan variants (now that enum values are committed)
-- Starter Annual: $15 x 10 = $150/year, 400 x 12 = 4,800 pages/year
INSERT INTO plans (name, display_name, daily_page_limit, monthly_page_limit, pii_masking, price_cents, is_recurring, allowed_formats)
VALUES ('starter_annual', 'Starter Annual', NULL, 4800, 'optional', 15000, true, ARRAY['csv', 'xlsx'])
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  monthly_page_limit = EXCLUDED.monthly_page_limit,
  price_cents = EXCLUDED.price_cents;

-- Professional Annual: $30 x 10 = $300/year, 1000 x 12 = 12,000 pages/year
INSERT INTO plans (name, display_name, daily_page_limit, monthly_page_limit, pii_masking, price_cents, is_recurring, allowed_formats)
VALUES ('pro_annual', 'Professional Annual', NULL, 12000, 'optional', 30000, true, ARRAY['csv', 'xlsx'])
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  monthly_page_limit = EXCLUDED.monthly_page_limit,
  price_cents = EXCLUDED.price_cents;

-- Business Annual: $50 x 10 = $500/year, 4000 x 12 = 48,000 pages/year
INSERT INTO plans (name, display_name, daily_page_limit, monthly_page_limit, pii_masking, price_cents, is_recurring, allowed_formats)
VALUES ('business_annual', 'Business Annual', NULL, 48000, 'enforced', 50000, true, ARRAY['csv', 'xlsx'])
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  monthly_page_limit = EXCLUDED.monthly_page_limit,
  price_cents = EXCLUDED.price_cents;

-- Update get_remaining_pages function to handle annual quota resets
CREATE OR REPLACE FUNCTION public.get_remaining_pages(
  p_user_id uuid DEFAULT NULL::uuid, 
  p_session_fingerprint text DEFAULT NULL::text
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_daily_limit INTEGER;
  v_monthly_limit INTEGER;
  v_billing_interval TEXT;
  v_started_at TIMESTAMPTZ;
  v_pages_used_today INTEGER;
  v_pages_used_period INTEGER;
  v_daily_remaining INTEGER;
  v_period_remaining INTEGER;
  v_plan_name TEXT;
BEGIN
  -- Authorization check: only allow querying own data
  IF p_user_id IS NOT NULL AND p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: cannot query other user usage';
  END IF;

  -- Get the user's limits and billing interval from subscription
  SELECT gup.daily_limit, gup.monthly_limit, gup.plan_name, us.billing_interval, us.started_at
  INTO v_daily_limit, v_monthly_limit, v_plan_name, v_billing_interval, v_started_at
  FROM get_user_plan(p_user_id) AS gup
  LEFT JOIN user_subscriptions us ON us.user_id = p_user_id AND us.status = 'active'
  LIMIT 1;
  
  -- Default billing interval if not set
  IF v_billing_interval IS NULL THEN
    v_billing_interval := 'monthly';
  END IF;
  
  -- If both limits are NULL, user has unlimited access
  IF v_daily_limit IS NULL AND v_monthly_limit IS NULL THEN
    RETURN -1; -- -1 indicates unlimited
  END IF;
  
  -- Get pages used today (for daily limits)
  SELECT COALESCE(SUM(pages_processed), 0) INTO v_pages_used_today
  FROM usage_tracking
  WHERE usage_date = CURRENT_DATE
    AND (
      (p_user_id IS NOT NULL AND user_id = p_user_id)
      OR (p_session_fingerprint IS NOT NULL AND session_fingerprint = p_session_fingerprint)
    );
  
  -- Get pages used in current period based on billing interval
  IF v_billing_interval = 'annual' AND v_started_at IS NOT NULL THEN
    -- For annual plans: reset on subscription anniversary
    SELECT COALESCE(SUM(pages_processed), 0) INTO v_pages_used_period
    FROM usage_tracking
    WHERE user_id = p_user_id
      AND usage_date >= (
        -- Calculate the most recent anniversary date
        v_started_at::DATE + (
          EXTRACT(YEAR FROM AGE(CURRENT_DATE, v_started_at::DATE))::INT * INTERVAL '1 year'
        )
      )::DATE;
  ELSE
    -- For monthly plans and lifetime: reset on 1st of month
    SELECT COALESCE(SUM(pages_processed), 0) INTO v_pages_used_period
    FROM usage_tracking
    WHERE usage_date >= date_trunc('month', CURRENT_DATE)::DATE
      AND (
        (p_user_id IS NOT NULL AND user_id = p_user_id)
        OR (p_session_fingerprint IS NOT NULL AND session_fingerprint = p_session_fingerprint)
      );
  END IF;
  
  -- Calculate remaining for each limit type
  IF v_daily_limit IS NOT NULL THEN
    v_daily_remaining := GREATEST(0, v_daily_limit - v_pages_used_today);
  ELSE
    v_daily_remaining := 999999; -- No daily limit
  END IF;
  
  IF v_monthly_limit IS NOT NULL THEN
    v_period_remaining := GREATEST(0, v_monthly_limit - v_pages_used_period);
  ELSE
    v_period_remaining := 999999; -- No period limit
  END IF;
  
  -- Return the more restrictive limit
  RETURN LEAST(v_daily_remaining, v_period_remaining);
END;
$function$;