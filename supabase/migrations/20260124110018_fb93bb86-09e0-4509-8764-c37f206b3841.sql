-- Add validation tracking columns for audit logging

-- Add validation_status column to processing_history
ALTER TABLE processing_history 
ADD COLUMN IF NOT EXISTS validation_status text DEFAULT 'unchecked',
ADD COLUMN IF NOT EXISTS error_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS warning_count integer DEFAULT 0;

-- Add pii_exposed column to export_logs for audit trail
ALTER TABLE export_logs 
ADD COLUMN IF NOT EXISTS pii_exposed boolean DEFAULT false;