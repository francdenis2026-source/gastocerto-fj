-- Força data/hora do servidor e valida valores em lançamentos criados por contas de criança
CREATE OR REPLACE FUNCTION public.enforce_kid_transaction_integrity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  dep_id uuid;
BEGIN
  dep_id := public.kid_dependent_id(auth.uid());

  IF TG_OP = 'INSERT' THEN
    IF dep_id IS NULL THEN
      RETURN NEW;
    END IF;

    -- data e hora sempre do servidor (a criança não escolhe)
    NEW.transaction_date := (now() AT TIME ZONE 'America/Sao_Paulo')::date;
    NEW.transaction_time := (now() AT TIME ZONE 'America/Sao_Paulo')::time;
    NEW.created_at := now();
    NEW.updated_at := now();
    NEW.deleted_at := NULL;

    IF NEW.amount IS NULL OR NEW.amount <= 0 THEN
      RAISE EXCEPTION 'O valor precisa ser maior que zero.';
    END IF;

    IF NEW.amount > 5000 THEN
      RAISE EXCEPTION 'Valor muito alto para um registro do Espaço Kids. Peça ajuda ao responsável.';
    END IF;

    RETURN NEW;
  END IF;

  -- UPDATE / DELETE: bloqueado para contas de criança
  IF dep_id IS NOT NULL THEN
    INSERT INTO public.kids_audit_log (user_id, dependent_id, action, title, description, amount, metadata)
    VALUES (
      COALESCE(OLD.user_id, NEW.user_id),
      dep_id,
      'kid_transaction_' || lower(TG_OP) || '_blocked',
      'Tentativa bloqueada de ' || CASE WHEN TG_OP = 'DELETE' THEN 'excluir' ELSE 'alterar' END || ' lançamento',
      OLD.description,
      OLD.amount,
      jsonb_build_object('transaction_id', OLD.id, 'transaction_date', OLD.transaction_date)
    );
    RAISE EXCEPTION 'Esse registro já foi salvo e não pode ser alterado. Fale com seu responsável.';
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_kid_transaction_integrity_ins ON public.transactions;
CREATE TRIGGER enforce_kid_transaction_integrity_ins
BEFORE INSERT ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.enforce_kid_transaction_integrity();

DROP TRIGGER IF EXISTS enforce_kid_transaction_integrity_upd ON public.transactions;
CREATE TRIGGER enforce_kid_transaction_integrity_upd
BEFORE UPDATE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.enforce_kid_transaction_integrity();

DROP TRIGGER IF EXISTS enforce_kid_transaction_integrity_del ON public.transactions;
CREATE TRIGGER enforce_kid_transaction_integrity_del
BEFORE DELETE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.enforce_kid_transaction_integrity();