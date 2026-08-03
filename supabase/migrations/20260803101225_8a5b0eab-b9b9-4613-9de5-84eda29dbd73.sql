
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.plans TO service_role;
GRANT ALL ON public.admin_logs TO service_role;
GRANT ALL ON public.user_roles TO service_role;

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
