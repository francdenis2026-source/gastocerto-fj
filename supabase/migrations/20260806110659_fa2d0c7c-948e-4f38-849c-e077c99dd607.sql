-- 1. Migrar transações antigas para novas categorias onde o nome coincide
UPDATE public.transactions t
SET category_id = c.id
FROM public.categories c
WHERE t.category_id IS NULL 
  AND c.name IN ('Esposa / Esposo', 'Mãe / Pai / Avós', 'Tio / Sobrinho / Primos', 'Amigos / Colegas', 'Aniversários', 'Confraternizações')
  AND (
    (c.name = 'Esposa / Esposo' AND t.notes ILIKE '%esposa%') OR
    (c.name = 'Esposa / Esposo' AND t.notes ILIKE '%esposo%') OR
    (c.name = 'Mãe / Pai / Avós' AND t.notes ILIKE '%mãe%') OR
    (c.name = 'Mãe / Pai / Avós' AND t.notes ILIKE '%pai%') OR
    (c.name = 'Aniversários' AND t.notes ILIKE '%aniversário%') OR
    (c.name = 'Confraternizações' AND t.notes ILIKE '%confraternização%')
  );

-- 2. Índices para busca por categoria no Espaço Kids
CREATE INDEX IF NOT EXISTS idx_transactions_tags_category ON public.transactions USING gin (tags);
CREATE INDEX IF NOT EXISTS idx_transactions_description_search ON public.transactions USING gin (to_tsvector('portuguese', description));

-- 3. Log de tentativas de login (tabela se não existir)
CREATE TABLE IF NOT EXISTS public.kid_login_attempts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text UNIQUE NOT NULL,
    attempts integer DEFAULT 0,
    locked_until timestamptz,
    last_attempt_at timestamptz,
    updated_at timestamptz DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.kid_login_attempts TO authenticated;
GRANT ALL ON public.kid_login_attempts TO service_role;
ALTER TABLE public.kid_login_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all attempts" ON public.kid_login_attempts
    FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
