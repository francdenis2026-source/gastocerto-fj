CREATE OR REPLACE FUNCTION public.audit_profile_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.admin_logs (
    actor_id,
    target_user_id,
    action,
    details
  )
  VALUES (
    auth.uid(),
    NEW.user_id,
    'profile_update',
    jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    )
  );
  RETURN NEW;
END;
$$;
