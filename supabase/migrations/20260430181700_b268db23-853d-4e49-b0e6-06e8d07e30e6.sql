-- Required for the Railway Paddle webhook handler's upsert
-- (.upsert(..., { onConflict: 'provider_subscription_id' })).
-- Without a unique constraint, repeated webhook deliveries would insert
-- duplicate rows instead of updating the existing subscription.
CREATE UNIQUE INDEX IF NOT EXISTS user_subscriptions_provider_subscription_id_key
  ON public.user_subscriptions (provider_subscription_id)
  WHERE provider_subscription_id IS NOT NULL;
