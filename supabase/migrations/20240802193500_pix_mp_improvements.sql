-- Add status and pix info to ledger_entries for better tracking if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ledger_entries' AND column_name = 'status') THEN
        ALTER TABLE public.ledger_entries ADD COLUMN status text DEFAULT 'approved';
    END IF;
END $$;

-- Ensure pix_transactions has updated_at
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pix_transactions' AND column_name = 'updated_at') THEN
        ALTER TABLE public.pix_transactions ADD COLUMN updated_at timestamptz DEFAULT now();
    END IF;
END $$;

-- Function to notify when a PIX transaction changes status
CREATE OR REPLACE FUNCTION public.notify_pix_status_change()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id uuid;
    v_title text;
    v_message text;
    v_severity text;
BEGIN
    IF (OLD.status IS DISTINCT FROM NEW.status) THEN
        v_user_id := NEW.user_id;
        v_severity := CASE WHEN NEW.status = 'approved' THEN 'info' ELSE 'warning' END;
        v_title := 'PIX: ' || CASE 
            WHEN NEW.status = 'approved' THEN 'Pagamento Aprovado'
            WHEN NEW.status = 'failed' THEN 'Pagamento Falhou'
            WHEN NEW.status = 'cancelled' THEN 'Pagamento Cancelado'
            ELSE 'Status Alterado'
        END;
        v_message := 'Sua transferência de ' || to_char(NEW.amount, 'L999G999G999D99') || ' para ' || COALESCE(NEW.external_recipient_name, 'um destinatário') || ' agora está ' || NEW.status || '.';

        INSERT INTO public.notifications (user_id, title, message, severity, type)
        VALUES (v_user_id, v_title, v_message, v_severity, 'pix_update');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_pix_status_change ON public.pix_transactions;
CREATE TRIGGER on_pix_status_change
    AFTER UPDATE ON public.pix_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_pix_status_change();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pix_transactions TO authenticated;
GRANT ALL ON public.pix_transactions TO service_role;
