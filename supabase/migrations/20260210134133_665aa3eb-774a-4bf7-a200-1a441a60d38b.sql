
-- Bank Profiles System
-- 6 tables for managing bank parsing configurations

-- 1. bank_profiles
CREATE TABLE public.bank_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_code text UNIQUE NOT NULL,
  bank_name text NOT NULL,
  display_name text NOT NULL,
  country_code text NOT NULL,
  currency_code text,
  swift_code text,
  version int NOT NULL DEFAULT 1,
  is_active bool NOT NULL DEFAULT true,
  is_verified bool NOT NULL DEFAULT false,
  confidence_threshold decimal NOT NULL DEFAULT 0.60,
  detect_patterns jsonb,
  transaction_patterns jsonb,
  validation_rules jsonb,
  regional_config jsonb,
  column_config jsonb,
  created_by uuid REFERENCES auth.users(id),
  source text,
  usage_count int NOT NULL DEFAULT 0,
  success_rate decimal,
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. bank_profile_versions
CREATE TABLE public.bank_profile_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_profile_id uuid NOT NULL REFERENCES public.bank_profiles(id) ON DELETE CASCADE,
  version int NOT NULL,
  profile_data jsonb,
  change_summary text,
  changed_by uuid REFERENCES auth.users(id),
  is_published bool NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. bank_profile_templates
CREATE TABLE public.bank_profile_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name text UNIQUE NOT NULL,
  description text,
  region text,
  template_patterns jsonb,
  banks_using_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. bank_profile_contributions
CREATE TABLE public.bank_profile_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name text NOT NULL,
  country_code text NOT NULL,
  proposed_profile jsonb,
  submitted_by uuid NOT NULL REFERENCES auth.users(id),
  contact_email text,
  sample_pdf_urls text[],
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid REFERENCES auth.users(id),
  review_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);

-- 5. bank_profile_test_results
CREATE TABLE public.bank_profile_test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_profile_id uuid NOT NULL REFERENCES public.bank_profiles(id) ON DELETE CASCADE,
  version int NOT NULL,
  test_file_name text,
  test_file_hash text,
  transactions_expected int,
  transactions_extracted int,
  accuracy_rate decimal,
  errors jsonb,
  tested_by uuid REFERENCES auth.users(id),
  test_duration_ms int,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 6. bank_aliases
CREATE TABLE public.bank_aliases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_profile_id uuid NOT NULL REFERENCES public.bank_profiles(id) ON DELETE CASCADE,
  alias_name text NOT NULL,
  alias_type text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (bank_profile_id, alias_name)
);

-- RLS
ALTER TABLE public.bank_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_profile_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_profile_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_profile_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_profile_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_aliases ENABLE ROW LEVEL SECURITY;

-- Public can SELECT active+verified bank_profiles
CREATE POLICY "Public can view active verified profiles"
  ON public.bank_profiles FOR SELECT
  USING (is_active = true AND is_verified = true);

-- Public can SELECT bank_profile_versions for published versions
CREATE POLICY "Public can view published versions"
  ON public.bank_profile_versions FOR SELECT
  USING (is_published = true);

-- Public can SELECT templates
CREATE POLICY "Public can view templates"
  ON public.bank_profile_templates FOR SELECT
  USING (true);

-- Public can SELECT aliases for active profiles
CREATE POLICY "Public can view aliases"
  ON public.bank_aliases FOR SELECT
  USING (true);

-- Public can SELECT test results
CREATE POLICY "Public can view test results"
  ON public.bank_profile_test_results FOR SELECT
  USING (true);

-- Authenticated users can INSERT contributions
CREATE POLICY "Users can submit contributions"
  ON public.bank_profile_contributions FOR INSERT
  WITH CHECK (auth.uid() = submitted_by);

-- Authenticated users can SELECT own contributions
CREATE POLICY "Users can view own contributions"
  ON public.bank_profile_contributions FOR SELECT
  USING (auth.uid() = submitted_by);

-- Indexes
CREATE INDEX idx_bank_profiles_is_active ON public.bank_profiles (is_active);
CREATE INDEX idx_bank_profiles_country_code ON public.bank_profiles (country_code);
CREATE INDEX idx_bank_profiles_usage_count ON public.bank_profiles (usage_count DESC);
CREATE INDEX idx_bank_profiles_name_search ON public.bank_profiles USING gin (to_tsvector('english', bank_name || ' ' || display_name));

-- Updated at trigger for bank_profiles
CREATE TRIGGER update_bank_profiles_updated_at
  BEFORE UPDATE ON public.bank_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Updated at trigger for bank_profile_templates
CREATE TRIGGER update_bank_profile_templates_updated_at
  BEFORE UPDATE ON public.bank_profile_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- increment_profile_usage function
CREATE OR REPLACE FUNCTION public.increment_profile_usage(
  profile_id uuid,
  was_successful bool,
  transaction_count int
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_usage int;
  v_current_rate decimal;
BEGIN
  SELECT usage_count, COALESCE(success_rate, 0)
  INTO v_current_usage, v_current_rate
  FROM bank_profiles
  WHERE id = profile_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Bank profile not found: %', profile_id;
  END IF;

  UPDATE bank_profiles
  SET
    usage_count = v_current_usage + 1,
    success_rate = (v_current_rate * v_current_usage + CASE WHEN was_successful THEN 1.0 ELSE 0.0 END) / (v_current_usage + 1),
    last_used_at = now(),
    updated_at = now()
  WHERE id = profile_id;
END;
$$;
