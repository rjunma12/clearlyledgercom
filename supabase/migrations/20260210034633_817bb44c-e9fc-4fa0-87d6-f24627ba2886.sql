
-- Drop existing processing_jobs table and recreate with correct schema
DROP TABLE IF EXISTS public.processing_jobs;

CREATE TABLE public.processing_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
  transactions JSONB DEFAULT '[]',
  total_transactions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.processing_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own jobs"
ON public.processing_jobs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own jobs"
ON public.processing_jobs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own jobs"
ON public.processing_jobs FOR UPDATE
USING (auth.uid() = user_id);

CREATE INDEX idx_processing_jobs_status ON public.processing_jobs(status);
CREATE INDEX idx_processing_jobs_created_at ON public.processing_jobs(created_at DESC);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION public.update_processing_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_processing_jobs_updated_at
BEFORE UPDATE ON public.processing_jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_processing_jobs_updated_at();
