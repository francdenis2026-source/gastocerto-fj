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
        transactionType: z.enum(["income", "expense"]).default("expense"),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const userId = context.userId;

    // Descobre o vínculo da criança para marcar o lançamento com a tag do
    // dependente — é isso que faz o gasto aparecer no painel do responsável.
    const { data: dependent } = await supabaseAdmin
      .from("dependents")
      .select("id, name, user_id")
      .eq("kid_user_id", userId)
      .maybeSingle();

    const tags = ["kid_self_expense"];
    if (dependent) tags.push(`dependente:${dependent.id}`);

    const { error } = await supabaseAdmin.from("transactions").insert({
      user_id: userId,
      description: data.description,
      amount: data.amount,
      transaction_type: data.transactionType,
      transaction_date: data.transactionDate,
      tags,
      status: "paid",
    });

    if (error) throw new Error(error.message);

    // Avisa o responsável em tempo real (painel Espaço Kids).
    if (dependent) {
      await supabaseAdmin
        .from("notifications")
        .insert({
          user_id: dependent.user_id,
          title: data.transactionType === 'income' ? "Novo ganho do filho" : "Gasto do filho registrado",
          message: `${dependent.name} registrou um ${data.transactionType === 'income' ? 'ganho' : 'gasto'} de ${data.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}.`,
          severity: "info",
          notification_type: data.transactionType === 'income' ? "kid_income" : "kid_expense",
          dedupe_key: `kid_expense_${dependent.id}_${Date.now()}`,
        } as never)
        .then(() => undefined, () => undefined);
    }

    return { success: true };
  });
