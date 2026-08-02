ALTER TABLE public.dependents
  ADD COLUMN IF NOT EXISTS kid_login_code text,
  ADD COLUMN IF NOT EXISTS kid_user_id uuid;

CREATE UNIQUE INDEX IF NOT EXISTS dependents_kid_login_code_key
  ON public.dependents (lower(kid_login_code)) WHERE kid_login_code IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS dependents_kid_user_id_key
  ON public.dependents (kid_user_id) WHERE kid_user_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.kid_dependent_id(_uid uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.dependents WHERE kid_user_id = _uid LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.kid_owner_id(_uid uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT user_id FROM public.dependents WHERE kid_user_id = _uid LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.kid_tag(_uid uuid)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT 'dependente:' || (SELECT id::text FROM public.dependents WHERE kid_user_id = _uid LIMIT 1);
$$;

CREATE POLICY "Kid reads own dependent row"
ON public.dependents FOR SELECT TO authenticated
USING (kid_user_id = auth.uid());

CREATE POLICY "Kid reads own savings goals"
ON public.kids_savings_goals FOR SELECT TO authenticated
USING (dependent_id = public.kid_dependent_id(auth.uid()));

CREATE POLICY "Kid creates own savings goals"
ON public.kids_savings_goals FOR INSERT TO authenticated
WITH CHECK (
  dependent_id = public.kid_dependent_id(auth.uid())
  AND user_id = public.kid_owner_id(auth.uid())
);

CREATE POLICY "Kid updates own savings goals"
ON public.kids_savings_goals FOR UPDATE TO authenticated
USING (dependent_id = public.kid_dependent_id(auth.uid()))
WITH CHECK (dependent_id = public.kid_dependent_id(auth.uid()));

CREATE POLICY "Kid reads own transactions"
ON public.transactions FOR SELECT TO authenticated
USING (
  public.kid_dependent_id(auth.uid()) IS NOT NULL
  AND user_id = public.kid_owner_id(auth.uid())
  AND tags @> ARRAY[public.kid_tag(auth.uid())]::text[]
);

CREATE POLICY "Kid creates own transactions"
ON public.transactions FOR INSERT TO authenticated
WITH CHECK (
  public.kid_dependent_id(auth.uid()) IS NOT NULL
  AND user_id = public.kid_owner_id(auth.uid())
  AND tags @> ARRAY[public.kid_tag(auth.uid())]::text[]
);

CREATE POLICY "Kid reads owner categories"
ON public.categories FOR SELECT TO authenticated
USING (
  public.kid_dependent_id(auth.uid()) IS NOT NULL
  AND user_id = public.kid_owner_id(auth.uid())
);

CREATE POLICY "Kid reads own audit log"
ON public.kids_audit_log FOR SELECT TO authenticated
USING (dependent_id = public.kid_dependent_id(auth.uid()));