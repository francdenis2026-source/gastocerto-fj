import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getFamilyBeneficiaries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Buscamos dependentes cadastrados na tabela dependents
    const { data: dependents, error } = await supabase
      .from("dependents")
      .select("id, name, birth_date, relation")
      .eq("user_id", user.id);

    if (error) {
      console.error("Erro ao buscar dependentes:", error);
      return { beneficiaries: [] };
    }

    const beneficiaries = (dependents ?? []).map(d => {
      let isAdult = false;
      if (d.birth_date) {
        const birth = new Date(d.birth_date);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
          age--;
        }
        isAdult = age >= 18;
      }

      return {
        id: d.id,
        name: d.name,
        type: d.relation === 'filho' ? 'child' as const : 'family_member' as const,
        isAdult
      };
    });
      
    return { beneficiaries };
  });
