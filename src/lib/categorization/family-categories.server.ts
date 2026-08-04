import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getFamilyBeneficiaries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Buscamos filhos (pelo sistema kids se houver) e outros perfis associados
    // Por enquanto, simulamos uma lista ou buscamos da tabela de perfis/kids se existirem
    // A implementação real dependerá da estrutura de dependentes que pode ser expandida.
    
    // Tentamos buscar kids associados
    const { data: kids } = await supabase
      .from("profiles")
      .select("user_id, full_name, metadata")
      .eq("metadata->>parent_id", user.id);
      
    return {
      beneficiaries: (kids ?? []).map(k => ({
        id: k.user_id,
        name: k.full_name || "Sem Nome",
        type: "kid" as const,
        isAdult: false
      }))
    };
  });
