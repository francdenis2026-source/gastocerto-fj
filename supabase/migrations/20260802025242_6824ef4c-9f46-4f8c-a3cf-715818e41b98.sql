-- Tabela de auditoria de perfil
CREATE TABLE public.profile_audit_logs (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    field_name text NOT NULL,
    old_value text,
    new_value text,
    changed_at timestamp with time zone NOT NULL DEFAULT now(),
    changed_by uuid REFERENCES auth.users(id)
);

GRANT SELECT ON public.profile_audit_logs TO authenticated;
GRANT ALL ON public.profile_audit_logs TO service_role;
ALTER TABLE public.profile_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own profile logs" 
ON public.profile_audit_logs FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Tabela de histórico de resgate de códigos
CREATE TABLE public.code_redemption_history (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    code text NOT NULL,
    code_type text NOT NULL, -- 'plan', 'coupon', 'license'
    status text NOT NULL,    -- 'success', 'already_used', 'invalid', 'blocked'
    redeemed_at timestamp with time zone NOT NULL DEFAULT now(),
    metadata jsonb
);

GRANT SELECT ON public.code_redemption_history TO authenticated;
GRANT ALL ON public.code_redemption_history TO service_role;
ALTER TABLE public.code_redemption_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own redemption history" 
ON public.code_redemption_history FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Trigger para auditar automaticamente mudanças no perfil (assumindo a tabela profiles)
CREATE OR REPLACE FUNCTION public.audit_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.full_name IS DISTINCT FROM NEW.full_name) THEN
        INSERT INTO public.profile_audit_logs (user_id, field_name, old_value, new_value, changed_by)
        VALUES (NEW.id, 'full_name', OLD.full_name, NEW.full_name, auth.uid());
    END IF;
    
    IF (OLD.cpf IS DISTINCT FROM NEW.cpf) THEN
        INSERT INTO public.profile_audit_logs (user_id, field_name, old_value, new_value, changed_by)
        VALUES (NEW.id, 'cpf', OLD.cpf, NEW.cpf, auth.uid());
    END IF;

    -- Nota: email geralmente está no auth.users, mas se estiver duplicado no profile:
    IF (TG_NARGS > 0 AND OLD.email IS DISTINCT FROM NEW.email) THEN
        INSERT INTO public.profile_audit_logs (user_id, field_name, old_value, new_value, changed_by)
        VALUES (NEW.id, 'email', OLD.email, NEW.email, auth.uid());
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar o trigger se a tabela profiles existir (assumindo nome padrão)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
        CREATE TRIGGER on_profile_update
        AFTER UPDATE ON public.profiles
        FOR EACH ROW EXECUTE FUNCTION public.audit_profile_changes();
    END IF;
END $$;
