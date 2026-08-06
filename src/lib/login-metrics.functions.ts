import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getLoginMetrics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    
    // Verificar se é admin
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
      
    if (!roleData) throw new Error("Acesso negado: Somente administradores.");

    // Buscar tentativas de login do Espaço Kids
    const { data: attempts, error } = await supabaseAdmin
      .from("kid_login_attempts")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(100);

    if (error) throw error;
    
    // Buscar auditoria de acessos
    const { data: audit, error: auditError } = await supabaseAdmin
      .from("kid_access_audit")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
      
    if (auditError) throw auditError;

    return { attempts, audit };
  });
