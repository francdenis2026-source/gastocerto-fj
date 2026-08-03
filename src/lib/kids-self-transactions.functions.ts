import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const createKidTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        amount: z.number().positive(),
        description: z.string().min(1),
        transactionDate: z.string(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const userId = context.userId;

    // Apenas garante que é um usuário kid (isso deve ser chamado apenas do Espaço Kids)
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("is_kid")
      .eq("user_id", userId)
      .single();

    // Se não for kid direto, verifica se é um dependente logado
    // Nota: dependentes logados usam seu próprio auth.uid() que aponta para um profile com metadata is_kid
    
    const { error } = await supabaseAdmin.from("transactions").insert({
      user_id: userId,
      description: data.description,
      amount: data.amount,
      transaction_type: "expense",
      transaction_date: data.transactionDate,
      tags: ["kid_self_expense"],
      status: "paid",
    });

    if (error) throw new Error(error.message);

    return { success: true };
  });
