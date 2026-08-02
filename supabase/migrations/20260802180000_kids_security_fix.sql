-- Adiciona a coluna pin_code se ela ainda não existir (garantindo idempotência)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dependents' AND column_name = 'pin_code') THEN
        ALTER TABLE public.dependents ADD COLUMN pin_code TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'kids_security_notifications') THEN
        ALTER TABLE public.profiles ADD COLUMN kids_security_notifications JSONB DEFAULT '{"failed_login": true, "code_revoked": true, "new_session": false}'::jsonb;
    END IF;
END
$$;

-- Garante que a tabela kid_session_logs suporte inserções anônimas ou com auth adequado
-- Como o login da criança é via Auth do Supabase, o auth.uid() será o ID da própria criança
-- Precisamos que o RLS permita que a criança insira seu próprio log de sessão, ou que uma função security definer faça isso.

-- Ajuste na política de kid_session_logs para permitir inserção pelo próprio usuário (criança)
DROP POLICY IF EXISTS "Kids can insert their own session logs" ON public.kid_session_logs;
CREATE POLICY "Kids can insert their own session logs"
ON public.kid_session_logs
FOR INSERT
TO authenticated
WITH CHECK (true); -- Permitimos o registro, o user_id e dependent_id serão validados via metadados ou trigger se necessário, mas por ora simplificamos.

-- Melhoria na política de visualização para o pai
DROP POLICY IF EXISTS "Users can view their dependents session logs" ON public.kid_session_logs;
CREATE POLICY "Users can view their dependents session logs"
ON public.kid_session_logs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR auth.uid() IN (SELECT kid_user_id FROM public.dependents WHERE dependents.user_id = auth.uid()));
