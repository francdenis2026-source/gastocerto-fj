ALTER TABLE public.dependents ADD COLUMN IF NOT EXISTS kid_code_expires_at TIMESTAMPTZ;
GRANT SELECT, UPDATE ON public.dependents TO authenticated;
GRANT ALL ON public.dependents TO service_role;