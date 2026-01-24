-- Create error_logs table for storing application errors
CREATE TABLE public.error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  -- Context
  user_id UUID,
  session_fingerprint TEXT,
  
  -- Error details
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_code TEXT,
  
  -- Source info
  component TEXT,
  action TEXT,
  
  -- Additional context (JSON)
  metadata JSONB DEFAULT '{}',
  
  -- Status for review
  status TEXT DEFAULT 'new',
  resolved_at TIMESTAMPTZ,
  notes TEXT
);

-- Indexes for efficient queries
CREATE INDEX idx_error_logs_created_at ON public.error_logs(created_at DESC);
CREATE INDEX idx_error_logs_user_id ON public.error_logs(user_id);
CREATE INDEX idx_error_logs_status ON public.error_logs(status);
CREATE INDEX idx_error_logs_error_type ON public.error_logs(error_type);

-- Enable RLS
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Anyone can insert errors (including anonymous users)
CREATE POLICY "Allow insert for all" ON public.error_logs
  FOR INSERT WITH CHECK (true);

-- Users can view their own errors
CREATE POLICY "Users can view own errors" ON public.error_logs
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);