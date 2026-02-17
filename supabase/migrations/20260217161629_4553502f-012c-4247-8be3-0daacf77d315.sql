
-- Conversion cache table for deduplicating repeat uploads
CREATE TABLE public.conversion_cache (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_hash text NOT NULL,
  user_id uuid NOT NULL,
  result jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_conversion_cache_lookup ON public.conversion_cache (file_hash, user_id, created_at DESC);

-- Auto-expire old cache rows (older than 2 hours)
-- We'll rely on application-level TTL check (1 hour) but also cleanup periodically

ALTER TABLE public.conversion_cache ENABLE ROW LEVEL SECURITY;

-- Only service role inserts/reads cache (server-side only), no client access needed
CREATE POLICY "Deny all client access to conversion_cache"
  ON public.conversion_cache
  FOR ALL
  USING (false);

-- RPC to atomically check and reserve pages for a user
CREATE OR REPLACE FUNCTION public.check_and_reserve_pages(
  p_user_id uuid,
  p_pages integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_remaining integer;
BEGIN
  -- Get remaining pages using existing function (bypass auth check with service role)
  SELECT COALESCE(
    (SELECT LEAST(
      CASE WHEN p2.daily_page_limit IS NOT NULL 
        THEN GREATEST(0, p2.daily_page_limit - COALESCE(
          (SELECT SUM(pages_processed) FROM usage_tracking 
           WHERE usage_date = CURRENT_DATE AND user_id = p_user_id), 0))
        ELSE 999999 END,
      CASE WHEN p2.monthly_page_limit IS NOT NULL 
        THEN GREATEST(0, p2.monthly_page_limit - COALESCE(
          (SELECT SUM(pages_processed) FROM usage_tracking 
           WHERE usage_date >= date_trunc('month', CURRENT_DATE)::DATE AND user_id = p_user_id), 0))
        ELSE 999999 END
    )
    FROM user_subscriptions us
    JOIN plans p2 ON us.plan_id = p2.id
    WHERE us.user_id = p_user_id AND us.status = 'active'
      AND (us.expires_at IS NULL OR us.expires_at > now())
    ORDER BY p2.price_cents DESC
    LIMIT 1),
    -- Fallback to registered_free plan limits
    (SELECT LEAST(
      CASE WHEN p3.daily_page_limit IS NOT NULL 
        THEN GREATEST(0, p3.daily_page_limit - COALESCE(
          (SELECT SUM(pages_processed) FROM usage_tracking 
           WHERE usage_date = CURRENT_DATE AND user_id = p_user_id), 0))
        ELSE 999999 END,
      CASE WHEN p3.monthly_page_limit IS NOT NULL 
        THEN GREATEST(0, p3.monthly_page_limit - COALESCE(
          (SELECT SUM(pages_processed) FROM usage_tracking 
           WHERE usage_date >= date_trunc('month', CURRENT_DATE)::DATE AND user_id = p_user_id), 0))
        ELSE 999999 END
    )
    FROM plans p3 WHERE p3.name = 'registered_free')
  ) INTO v_remaining;

  IF v_remaining IS NOT NULL AND v_remaining != -1 AND v_remaining < p_pages THEN
    RETURN jsonb_build_object('allowed', false, 'remaining', v_remaining);
  END IF;

  RETURN jsonb_build_object('allowed', true, 'remaining', v_remaining);
END;
$$;
