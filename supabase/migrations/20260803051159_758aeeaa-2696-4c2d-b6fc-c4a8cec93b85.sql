CREATE OR REPLACE FUNCTION public.sync_kid_mirror_tx()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  origin_tag text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    origin_tag := 'origin:' || OLD.id::text;
    DELETE FROM public.transactions t
    WHERE t.id <> OLD.id AND t.tags @> ARRAY[origin_tag];
    RETURN OLD;
  END IF;

  origin_tag := 'origin:' || NEW.id::text;

  IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    DELETE FROM public.transactions t
    WHERE t.id <> NEW.id AND t.tags @> ARRAY[origin_tag];
  ELSIF NEW.amount IS DISTINCT FROM OLD.amount OR NEW.transaction_date IS DISTINCT FROM OLD.transaction_date THEN
    UPDATE public.transactions t
    SET amount = NEW.amount,
        transaction_date = NEW.transaction_date,
        updated_at = now()
    WHERE t.id <> NEW.id AND t.tags @> ARRAY[origin_tag];
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_kid_mirror_tx ON public.transactions;
CREATE TRIGGER trg_sync_kid_mirror_tx
AFTER UPDATE OR DELETE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.sync_kid_mirror_tx();

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;