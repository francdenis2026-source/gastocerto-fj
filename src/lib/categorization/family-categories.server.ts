import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getFamilyBeneficiaries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Buscamos perfis que tenham um metadado indicando quem é o pai/responsável
    // A consulta usa o operador ->> para acessar campos dentro do JSONB metadata
    const { data: familyProfiles, error } = await supabase
      .from("profiles")
      .select("user_id, full_name, metadata")
      .not("metadata", "is", null);

    if (error) {
      console.error("Erro ao buscar beneficiários familiares:", error);
      return { beneficiaries: [] };
    }

    // Filtramos manualmente para garantir compatibilidade com o tipo Json do Supabase
    const beneficiaries = (familyProfiles ?? [])
      .filter(p => {
        const meta = p.metadata as Record<string, any> | null;
        return meta && meta.parent_id === user.id;
      })
      .map(p => ({
        id: p.user_id,
        name: p.full_name || "Membro da Família",
        type: "family_member" as const,
        isAdult: (p.metadata as Record<string, any>)?.is_adult === true
      }));
      
    return { beneficiaries };
  });
