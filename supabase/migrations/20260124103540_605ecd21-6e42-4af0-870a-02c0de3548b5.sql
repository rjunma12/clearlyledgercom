-- Create export_logs table for audit trail
CREATE TABLE public.export_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  filename text NOT NULL,
  export_type text NOT NULL CHECK (export_type IN ('masked', 'full')),
  format text NOT NULL CHECK (format IN ('csv', 'xlsx')),
  transaction_count int NOT NULL DEFAULT 0,
  page_count int,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.export_logs ENABLE ROW LEVEL SECURITY;

-- Users can only view their own export logs
CREATE POLICY "Users can view their own exports"
ON public.export_logs FOR SELECT
USING (auth.uid() = user_id);

-- Create index for efficient queries
CREATE INDEX idx_export_logs_user_created ON public.export_logs(user_id, created_at DESC);

-- Add comment for documentation
COMMENT ON TABLE public.export_logs IS 'Audit trail for all file exports, tracking export type and user entitlements';