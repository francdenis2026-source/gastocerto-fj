-- 1. Auditoria de Sessões Kids (IP e Dispositivo)
CREATE TABLE IF NOT EXISTS public.kid_session_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dependent_id UUID REFERENCES public.dependents(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    device_info JSONB,
    location_info JSONB,
    status TEXT DEFAULT 'active', -- 'active', 'blocked'
    last_active_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.kid_session_logs TO authenticated;
GRANT ALL ON public.kid_session_logs TO service_role;

ALTER TABLE public.kid_session_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their dependents session logs"
ON public.kid_session_logs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2. Configurações de Notificações Kids no Profile
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS kids_security_notifications JSONB DEFAULT '{"failed_login": true, "code_revoked": true, "new_session": false}'::jsonb;

-- 3. Categoria de Churrasco e Fim de Semana
INSERT INTO public.categories (name, color, icon, transaction_type, is_essential)
VALUES 
('Churrasco & Fim de Semana', '#ea580c', 'flame', 'expense', false)
ON CONFLICT (name, transaction_type) DO NOTHING;

-- 4. Função para Bloquear Sessão suspeita
CREATE OR REPLACE FUNCTION public.block_kid_session(session_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.kid_session_logs 
  SET status = 'blocked' 
  WHERE id = session_id 
    AND user_id = auth.uid();
END;
$$;

GRANT EXECUTE ON FUNCTION public.block_kid_session(UUID) TO authenticated;
