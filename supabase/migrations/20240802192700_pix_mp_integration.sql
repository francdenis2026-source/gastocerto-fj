-- Adicionar campos de gênero e avatar para dependentes se não existirem
ALTER TABLE public.dependents ADD COLUMN IF NOT EXISTS gender text DEFAULT 'other';
ALTER TABLE public.dependents ADD COLUMN IF NOT EXISTS avatar_url text;

-- Tabela para transações PIX via Mercado Pago
CREATE TABLE IF NOT EXISTS public.pix_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    recipient_id uuid REFERENCES public.dependents(id) ON DELETE SET NULL,
    amount decimal(12,2) NOT NULL,
    status text NOT NULL DEFAULT 'pending', -- pending, approved, rejected, cancelled
    description text,
    external_recipient_key text,
    external_recipient_name text,
    mercadopago_payment_id text UNIQUE,
    pix_copy_paste text,
    pix_qr_code_base64 text,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Tabela de Ledger (Razão) para rastreabilidade financeira
CREATE TABLE IF NOT EXISTS public.ledger_entries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    dependent_id uuid REFERENCES public.dependents(id) ON DELETE SET NULL,
    pix_transaction_id uuid REFERENCES public.pix_transactions(id) ON DELETE SET NULL,
    type text NOT NULL, -- credit, debit
    amount decimal(12,2) NOT NULL,
    description text,
    balance_after decimal(12,2),
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Auditoria específica para PIX
CREATE TABLE IF NOT EXISTS public.pix_audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    pix_transaction_id uuid REFERENCES public.pix_transactions(id) ON DELETE CASCADE,
    action text NOT NULL,
    payload jsonb,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Permissões
GRANT SELECT, INSERT, UPDATE ON public.pix_transactions TO authenticated;
GRANT ALL ON public.pix_transactions TO service_role;

GRANT SELECT, INSERT ON public.ledger_entries TO authenticated;
GRANT ALL ON public.ledger_entries TO service_role;

GRANT SELECT ON public.pix_audit_logs TO authenticated;
GRANT ALL ON public.pix_audit_logs TO service_role;

-- RLS
ALTER TABLE public.pix_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pix_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own pix transactions" ON public.pix_transactions
    FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own ledger entries" ON public.ledger_entries
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can view audit logs for their transactions" ON public.pix_audit_logs
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.pix_transactions
            WHERE pix_transactions.id = pix_audit_logs.pix_transaction_id
            AND pix_transactions.user_id = auth.uid()
        )
    );
