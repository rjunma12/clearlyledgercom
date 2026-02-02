-- Step 1: Add annual plan variants to plan_type enum
ALTER TYPE plan_type ADD VALUE IF NOT EXISTS 'starter_annual';
ALTER TYPE plan_type ADD VALUE IF NOT EXISTS 'pro_annual';
ALTER TYPE plan_type ADD VALUE IF NOT EXISTS 'business_annual';

-- Add billing_interval column to user_subscriptions
ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS billing_interval TEXT DEFAULT 'monthly';

-- Add constraint for valid billing interval values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_billing_interval'
  ) THEN
    ALTER TABLE user_subscriptions 
    ADD CONSTRAINT valid_billing_interval 
    CHECK (billing_interval IN ('monthly', 'annual', 'lifetime'));
  END IF;
END $$;