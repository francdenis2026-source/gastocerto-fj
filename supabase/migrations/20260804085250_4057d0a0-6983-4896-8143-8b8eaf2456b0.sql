ALTER TABLE public.admin_logs ALTER COLUMN actor_id DROP NOT NULL;

ALTER TABLE public.admin_logs
  ADD CONSTRAINT admin_logs_actor_id_fkey
  FOREIGN KEY (actor_id) REFERENCES public.profiles(user_id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS admin_logs_actor_id_idx ON public.admin_logs (actor_id);
CREATE INDEX IF NOT EXISTS admin_logs_target_user_id_idx ON public.admin_logs (target_user_id);

CREATE OR REPLACE FUNCTION public.audit_profile_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.admin_logs (actor_id, target_user_id, action, details)
  VALUES (
    (SELECT p.user_id FROM public.profiles p WHERE p.user_id = auth.uid()),
    NEW.user_id,
    'profile_update',
    jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$function$;