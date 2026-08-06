import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/lib/integrations/supabase/client.server";

export const syncKidTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        dependentId: z.string().uuid(),
        amount: z.number(),
        description: z.string(),
        transactionDate: z.string(),
        type: z.enum(["income", "expense"]),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    // 1. Registrar como despesa no painel do pai (se for envio de dinheiro ou gasto com filho)
    // Usamos supabaseAdmin para garantir a integridade da transação cruzada
    const tag = `dependente:${data.dependentId}`;

    const { error: parentError } = await supabaseAdmin.from("transactions").insert({
      user_id: context.userId,
      description: `[Informativo Kid] ${data.description}`,
      amount: data.amount,
      // Para o pai, monitoramos o fluxo: se a criança ganhou, o pai vê como 'income' informativo.
      // Se a criança gastou, o pai vê como 'expense' informativo.
      transaction_type: data.type, 
      transaction_date: data.transactionDate,
      category_id: null,
      tags: [tag, "kid_self_expense", "auto_kids"], // kid_self_expense marca como informativo (não afeta saldo real do pai)
      status: "paid",
    });

    if (parentError) throw new Error(parentError.message);

    // 2. Se for 'income' para a criança (recebeu do pai), isso já deve estar refletido no saldo dela
    // A trigger 'enforce_kid_transaction_integrity' no banco já cuida da segurança do lado da criança
    
    return { success: true };
  });
