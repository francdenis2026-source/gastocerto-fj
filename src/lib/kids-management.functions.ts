import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const giveMoneyToKid = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        dependentId: z.string().uuid(),
        amount: z.number().positive(),
        description: z.string().min(1),
        type: z.enum(["cash", "pix", "gift", "value"]),
        transactionDate: z.string(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { dependentId, amount, description, type, transactionDate } = data;
    const userId = context.userId;

    const { data: dependent, error: depError } = await supabaseAdmin
      .from("dependents")
      .select("id, name, kid_user_id")
      .eq("id", dependentId)
      .eq("user_id", userId)
      .single();

    if (depError || !dependent) throw new Error("Dependente não encontrado ou sem permissão.");

    const parentTag = `dependente:${dependentId}`;
    const dedupeKey = `kid_money_${dependentId}_${Date.now()}`;
    
    const { error: parentError } = await supabaseAdmin.from("transactions").insert({
      user_id: userId,
      description: `[Envio para ${dependent.name}] ${description} (${type.toUpperCase()})`,
      amount: amount,
      transaction_type: "expense",
      transaction_date: transactionDate,
      category_id: null, 
      tags: [parentTag, "kids_management", `type:${type}`],
      status: "paid",
    });

    if (parentError) throw new Error(`Erro ao registrar gasto do responsável: ${parentError.message}`);

    if (dependent.kid_user_id) {
      // 1. Criar transação para a criança
      const { error: kidError } = await supabaseAdmin.from("transactions").insert({
        user_id: dependent.kid_user_id,
        description: `Recebido: ${description}`,
        amount: amount,
        transaction_type: "income",
        transaction_date: transactionDate,
        tags: ["from_parent", `type:${type}`],
        status: "paid",
      });
      if (kidError) console.error("Erro ao registrar entrada no painel da criança:", kidError.message);

      // 2. Criar notificação persistente para a criança
      await supabaseAdmin.from("notifications").insert({
        user_id: dependent.kid_user_id,
        title: "Dinheiro recebido! 💰",
        message: `Você recebeu ${amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} via ${type.toUpperCase()}. (${description})`,
        severity: "info",
        notification_type: "kid_income",
        dedupe_key: dedupeKey,
        metadata: { amount, type, description }
      } as any);
    }

    const { error: auditError } = await supabaseAdmin.from("kid_access_audit").insert({
      user_id: userId,
      dependent_id: dependentId,
      action: "give_money",
      details: { amount, type, description }
    } as any);
    if (auditError) console.error("Erro ao registrar auditoria:", auditError.message);

    return { success: true };
  });

export const getKidsFinancialMetrics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({
      dependentId: z.string().uuid().optional(),
    }).parse(data)
  )
  .handler(async ({ data, context }) => {
    const userId = context.userId;
    const { dependentId } = data;

    let query = supabaseAdmin
      .from("transactions")
      .select("id, amount, description, transaction_date, tags, transaction_type")
      .eq("user_id", userId)
      .eq("transaction_type", "expense");

    const { data: transactions, error } = await query;
    if (error) throw error;

    // Filter in JS to simplify complex tag logic for both auto_kids and kids_management
    const filtered = (transactions || []).filter(tx => {
      const tags = tx.tags || [];
      const isKidTx = tags.includes("auto_kids") || tags.includes("kids_management");
      if (!isKidTx) return false;
      if (dependentId) return tags.includes(`dependente:${dependentId}`);
      return true;
    });

    return filtered;
  });
