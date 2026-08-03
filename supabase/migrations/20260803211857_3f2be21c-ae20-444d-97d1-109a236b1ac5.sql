ALTER TABLE public.admin_access_codes DROP CONSTRAINT admin_access_codes_created_by_fkey;
ALTER TABLE public.admin_access_codes ADD CONSTRAINT admin_access_codes_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.profile_audit_logs DROP CONSTRAINT profile_audit_logs_changed_by_fkey;
ALTER TABLE public.profile_audit_logs ADD CONSTRAINT profile_audit_logs_changed_by_fkey
  FOREIGN KEY (changed_by) REFERENCES auth.users(id) ON DELETE SET NULL;