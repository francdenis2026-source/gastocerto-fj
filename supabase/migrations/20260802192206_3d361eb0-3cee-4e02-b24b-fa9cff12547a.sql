-- Adicionar campo gender e avatar_url na tabela dependents
ALTER TABLE public.dependents ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE public.dependents ADD COLUMN IF NOT EXISTS avatar_url text;

-- Criar tabela pix_transactions
CREATE TABLE IF NOT EXISTS public.pix_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_id uuid REFERENCES public.dependents(id) ON DELETE SET NULL, -- Se for para uma criança
    external_recipient_key text, -- Se for para um terceiro
    external_recipient_name text,
    amount numeric(12,2) NOT NULL CHECK (amount > 0),
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'failed')),
    pix_qr_code text,
    pix_copy_paste text,
    mercadopago_payment_id text,
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS e permissões para pix_transactions
ALTER TABLE public.pix_transactions ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pix_transactions TO authenticated;
GRANT ALL ON public.pix_transactions TO service_role;

CREATE POLICY "Users can manage their own pix transactions" ON public.pix_transactions
    FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Criar tabela ledger_entries (Livro Razão)
CREATE TABLE IF NOT EXISTS public.ledger_entries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    dependent_id uuid REFERENCES public.dependents(id) ON DELETE CASCADE,
    pix_transaction_id uuid REFERENCES public.pix_transactions(id) ON DELETE SET NULL,
    type text NOT NULL CHECK (type IN ('credit', 'debit')),
    amount numeric(12,2) NOT NULL,
    description text,
    created_at timestamptz DEFAULT now()
);

-- Habilitar RLS e permissões para ledger_entries
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ledger_entries TO authenticated;
GRANT ALL ON public.ledger_entries TO service_role;

CREATE POLICY "Users can manage their own ledger entries" ON public.ledger_entries
    FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Auditoria para PIX e Ledger
CREATE TABLE IF NOT EXISTS public.pix_audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action text NOT NULL,
    details jsonb,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.pix_audit_logs ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT ON public.pix_audit_logs TO authenticated;
GRANT ALL ON public.pix_audit_logs TO service_role;

CREATE POLICY "Users can see their own pix audit logs" ON public.pix_audit_logs
    FOR SELECT TO authenticated USING (auth.uid() = user_id);
