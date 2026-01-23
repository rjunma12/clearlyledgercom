-- Add GDPR-compliant DELETE policy for email_preferences
CREATE POLICY "Users can delete their own email preferences"
  ON public.email_preferences
  FOR DELETE
  USING (auth.uid() = user_id);