-- Permitir que cada usuário limpe seus próprios registros de auditoria/histórico
CREATE POLICY "Users can delete own profile audit logs"
ON public.profile_audit_logs FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own redemption history"
ON public.code_redemption_history FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own kid access audit"
ON public.kid_access_audit FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own purchase audit"
ON public.purchase_audit_log FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own fuel audit"
ON public.fuel_audit_log FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own note history"
ON public.transaction_note_history FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own closed period audit"
ON public.closed_period_audit FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ai usage log"
ON public.ai_usage_log FOR DELETE TO authenticated
USING (auth.uid() = user_id);

GRANT DELETE ON public.profile_audit_logs TO authenticated;
GRANT DELETE ON public.code_redemption_history TO authenticated;
GRANT DELETE ON public.kid_access_audit TO authenticated;
GRANT DELETE ON public.purchase_audit_log TO authenticated;
GRANT DELETE ON public.fuel_audit_log TO authenticated;
GRANT DELETE ON public.transaction_note_history TO authenticated;
GRANT DELETE ON public.closed_period_audit TO authenticated;
GRANT DELETE ON public.ai_usage_log TO authenticated;