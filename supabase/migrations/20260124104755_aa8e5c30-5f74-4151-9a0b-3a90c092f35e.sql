-- Add allowed_formats column to plans table
ALTER TABLE public.plans 
ADD COLUMN allowed_formats text[] DEFAULT ARRAY['csv', 'xlsx'];

-- Update anonymous and registered_free plans to only allow xlsx (Excel only)
UPDATE public.plans 
SET allowed_formats = ARRAY['xlsx'] 
WHERE name IN ('anonymous', 'registered_free');

-- Ensure paid plans have both formats
UPDATE public.plans 
SET allowed_formats = ARRAY['csv', 'xlsx'] 
WHERE name IN ('starter', 'pro', 'business', 'lifetime');