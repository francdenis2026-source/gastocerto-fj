CREATE OR REPLACE FUNCTION public.sync_kid_mirror_tx()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  origin_tag text;
  dep_tag text;
  dep_id uuid;
  kid_uid uuid;
  ref record;
  mirror_ids uuid[];
BEGIN
  ref := COALESCE(NEW, OLD);
  origin_tag := 'origin:' || ref.id::text;

  dep_tag := (SELECT t FROM unnest(COALESCE(ref.tags, '{}'::text[])) AS t WHERE t LIKE 'dependente:%' LIMIT 1);
  IF dep_tag IS NOT NULL THEN
    BEGIN
      dep_id := split_part(dep_tag, ':', 2)::uuid;
    EXCEPTION WHEN others THEN
      dep_id := NULL;
    END;
  END IF;

  IF dep_id IS NOT NULL THEN
    SELECT kid_user_id INTO kid_uid FROM public.dependents WHERE id = dep_id;
  END IF;

  -- Localiza o espelho: preferência pela marca de origem, com plano B para registros legados
  SELECT array_agg(t.id) INTO mirror_ids
  FROM public.transactions t
  WHERE t.id <> ref.id AND t.tags @> ARRAY[origin_tag];

  IF (mirror_ids IS NULL OR array_length(mirror_ids, 1) IS NULL) AND kid_uid IS NOT NULL THEN
    SELECT array_agg(t.id) INTO mirror_ids
    FROM (
      SELECT t.id
      FROM public.transactions t
      WHERE t.id <> ref.id
        AND t.user_id = kid_uid
        AND t.tags @> ARRAY['from_parent']
        AND t.amount = COALESCE(OLD.amount, NEW.amount)
        AND t.transaction_date = COALESCE(OLD.transaction_date, NEW.transaction_date)
      ORDER BY t.created_at DESC
      LIMIT 1
    ) t;
  END IF;

  IF mirror_ids IS NULL OR array_length(mirror_ids, 1) IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.transactions WHERE id = ANY(mirror_ids);
    RETURN OLD;
  END IF;

  IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    DELETE FROM public.transactions WHERE id = ANY(mirror_ids);
  ELSIF NEW.amount IS DISTINCT FROM OLD.amount OR NEW.transaction_date IS DISTINCT FROM OLD.transaction_date THEN
    UPDATE public.transactions
    SET amount = NEW.amount, transaction_date = NEW.transaction_date, updated_at = now()
    WHERE id = ANY(mirror_ids);
  END IF;

  RETURN NEW;
END;
$function$;