ALTER TABLE public.dependents
  ADD COLUMN IF NOT EXISTS kid_visibility jsonb NOT NULL DEFAULT '{"balance":true,"income":true,"goals":true,"history":true,"siblings":true}'::jsonb;

CREATE TABLE IF NOT EXISTS public.kid_access_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  dependent_id uuid REFERENCES public.dependents(id) ON DELETE SET NULL,
  dependent_name text,
  action text NOT NULL,
  code text,
  expires_at timestamptz,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.kid_access_audit TO authenticated;
GRANT ALL ON public.kid_access_audit TO service_role;
ALTER TABLE public.kid_access_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "kid_access_audit_owner_select" ON public.kid_access_audit
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "kid_access_audit_owner_insert" ON public.kid_access_audit
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS kid_access_audit_user_idx ON public.kid_access_audit (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.kid_login_attempts (
  code text PRIMARY KEY,
  attempts integer NOT NULL DEFAULT 0,
  locked_until timestamptz,
  last_attempt_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.kid_login_attempts TO service_role;
ALTER TABLE public.kid_login_attempts ENABLE ROW LEVEL SECURITY;