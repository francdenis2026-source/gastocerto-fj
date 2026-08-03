-- 1) SUPPORT TICKETS
CREATE TABLE public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.support_tickets TO authenticated;
GRANT ALL ON public.support_tickets TO service_role;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own tickets select" ON public.support_tickets FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'support'));
CREATE POLICY "own tickets insert" ON public.support_tickets FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tickets update" ON public.support_tickets FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "tickets delete" ON public.support_tickets FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER support_tickets_updated_at BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) PLAN CONFIGS
CREATE TABLE public.plan_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  monthly_price numeric NOT NULL DEFAULT 0,
  annual_price numeric NOT NULL DEFAULT 0,
  limits jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plan_configs TO authenticated;
GRANT ALL ON public.plan_configs TO service_role;
ALTER TABLE public.plan_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plan configs read" ON public.plan_configs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'support'));
CREATE POLICY "plan configs write" ON public.plan_configs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER plan_configs_updated_at BEFORE UPDATE ON public.plan_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.plan_configs (slug, name, monthly_price, annual_price, limits)
SELECT p.slug, p.name, p.monthly_price, p.annual_price,
  jsonb_build_object('transaction_limit', p.transaction_limit, 'vehicle_limit', p.vehicle_limit)
FROM public.plans p
ON CONFLICT (slug) DO NOTHING;

-- 3) GLOBAL ANNOUNCEMENTS
CREATE TABLE public.global_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.global_announcements TO authenticated;
GRANT ALL ON public.global_announcements TO service_role;
ALTER TABLE public.global_announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "announcements read" ON public.global_announcements FOR SELECT TO authenticated
  USING (active OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'support'));
CREATE POLICY "announcements write" ON public.global_announcements FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER global_announcements_updated_at BEFORE UPDATE ON public.global_announcements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4) BUSINESS METRICS
CREATE TABLE public.business_metrics_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  mrr numeric NOT NULL DEFAULT 0,
  new_customers integer NOT NULL DEFAULT 0,
  churned_customers integer NOT NULL DEFAULT 0,
  active_customers integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.business_metrics_daily TO authenticated;
GRANT ALL ON public.business_metrics_daily TO service_role;
ALTER TABLE public.business_metrics_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY "metrics admin read" ON public.business_metrics_daily FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER business_metrics_daily_updated_at BEFORE UPDATE ON public.business_metrics_daily
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5) EXTERNAL ACCESS CODES
CREATE TABLE public.external_access_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL,
  access_code text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  password_salt text NOT NULL,
  permissions jsonb NOT NULL DEFAULT '{}'::jsonb,
  expires_at timestamptz,
  revoked_at timestamptz,
  view_count integer NOT NULL DEFAULT 0,
  last_viewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.external_access_codes TO authenticated;
GRANT ALL ON public.external_access_codes TO service_role;
ALTER TABLE public.external_access_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own external codes" ON public.external_access_codes FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER external_access_codes_updated_at BEFORE UPDATE ON public.external_access_codes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6) EXTERNAL ACCESS LOGS
CREATE TABLE public.external_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id uuid NOT NULL REFERENCES public.external_access_codes(id) ON DELETE CASCADE,
  action text NOT NULL,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.external_access_logs TO authenticated;
GRANT ALL ON public.external_access_logs TO service_role;
ALTER TABLE public.external_access_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner reads external logs" ON public.external_access_logs FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.external_access_codes c
    WHERE c.id = external_access_logs.code_id AND c.user_id = auth.uid()
  ));

-- 7) KID SESSION LOGS
CREATE TABLE public.kid_session_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dependent_id uuid NOT NULL REFERENCES public.dependents(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active',
  ip_address text,
  user_agent text,
  device_info jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kid_session_logs TO authenticated;
GRANT ALL ON public.kid_session_logs TO service_role;
ALTER TABLE public.kid_session_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "parent manages kid sessions" ON public.kid_session_logs FOR ALL TO authenticated
  USING (auth.uid() = user_id OR public.kid_dependent_id(auth.uid()) = dependent_id)
  WITH CHECK (auth.uid() = user_id OR public.kid_dependent_id(auth.uid()) = dependent_id);
CREATE TRIGGER kid_session_logs_updated_at BEFORE UPDATE ON public.kid_session_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();