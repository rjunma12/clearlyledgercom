
-- Create processing_jobs table for server-side PDF processing
CREATE TABLE public.processing_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_size_bytes INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',
  pdf_type TEXT,
  pages_processed INTEGER DEFAULT 0,
  transactions_extracted INTEGER DEFAULT 0,
  validation_status TEXT DEFAULT 'unchecked',
  error_count INTEGER DEFAULT 0,
  warning_count INTEGER DEFAULT 0,
  processing_time_ms INTEGER,
  result JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.processing_jobs ENABLE ROW LEVEL SECURITY;

-- Users can view their own jobs
CREATE POLICY "Users can view their own processing jobs"
ON public.processing_jobs FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own jobs
CREATE POLICY "Users can insert their own processing jobs"
ON public.processing_jobs FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own jobs (for status updates)
CREATE POLICY "Users can update their own processing jobs"
ON public.processing_jobs FOR UPDATE
USING (auth.uid() = user_id);

-- Index for user lookups
CREATE INDEX idx_processing_jobs_user_id ON public.processing_jobs(user_id);
CREATE INDEX idx_processing_jobs_status ON public.processing_jobs(status);
CREATE INDEX idx_processing_jobs_created_at ON public.processing_jobs(created_at DESC);
