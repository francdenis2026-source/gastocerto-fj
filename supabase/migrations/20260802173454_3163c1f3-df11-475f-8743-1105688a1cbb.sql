CREATE TABLE public.credit_cards (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    institution text,
    last_digits text,
    limit_amount numeric(12,2) DEFAULT 0,
    current_balance numeric(12,2) DEFAULT 0,
    due_day integer,
    closing_day integer,
    color text,
    icon text,
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.credit_cards TO authenticated;
GRANT ALL ON public.credit_cards TO service_role;

ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own credit cards" 
ON public.credit_cards FOR ALL 
TO authenticated 
USING (auth.uid() = user_id);

CREATE TABLE public.card_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id uuid REFERENCES public.credit_cards(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
    amount numeric(12,2) NOT NULL,
    description text,
    transaction_date date NOT NULL DEFAULT current_date,
    installments_total integer DEFAULT 1,
    installment_current integer DEFAULT 1,
    created_at timestamptz DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.card_transactions TO authenticated;
GRANT ALL ON public.card_transactions TO service_role;

ALTER TABLE public.card_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own card transactions" 
ON public.card_transactions FOR ALL 
TO authenticated 
USING (auth.uid() = user_id);

-- Adiciona campos faltantes em commitments se necessário (paid_amount já deve existir em algum lugar ou vamos garantir)
ALTER TABLE public.commitments ADD COLUMN IF NOT EXISTS paid_amount numeric(12,2) DEFAULT 0;
