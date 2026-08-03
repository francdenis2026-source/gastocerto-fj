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
    
    const { data: parentTx, error: parentError } = await supabaseAdmin
      .from("transactions")
      .insert({
        user_id: userId,
        description: `[Envio para ${dependent.name}] ${description} (${type.toUpperCase()})`,
        amount: amount,
        transaction_type: "expense",
        transaction_date: transactionDate,
        category_id: null,
        tags: [parentTag, "kids_management", `type:${type}`, `parent_desc:${description}`],
        status: "paid",
      })
      .select("id")
      .single();

    if (parentError || !parentTx) {
      throw new Error(`Erro ao registrar gasto do responsável: ${parentError?.message ?? "falha"}`);
    }

    if (dependent.kid_user_id) {
      // Nota: Não inserimos mais o espelho manualmente aqui para evitar duplicidade.
      // O banco de dados agora possui a trigger 'trg_sync_kid_mirror_tx' que detecta 
      // a tag 'kids_management' e cria o espelho automaticamente com a tag 'origin'.
      
      // Criar notificação persistente para a criança
      await supabaseAdmin.from("notifications").insert({
        user_id: dependent.kid_user_id,
        title: "Dinheiro recebido! 💰",
        message: `Você recebeu ${amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} do seu responsável.`,
        severity: "info",
        notification_type: "kid_income",
        dedupe_key: dedupeKey,
        metadata: { amount, type }
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
      month: z.number().optional(),
      year: z.number().optional(),
    }).parse(data)
  )
  .handler(async ({ data, context }) => {
    const userId = context.userId;
    const { dependentId, month, year } = data;

    let query = supabaseAdmin
      .from("transactions")
      .select("id, amount, description, transaction_date, tags, transaction_type, status")
      .eq("user_id", userId);

    if (year && month) {
      const start = `${year}-${String(month).padStart(2, '0')}-01`;
      const end = new Date(year, month, 0).toISOString().split('T')[0] + 'T23:59:59';
      query = query.gte("transaction_date", start).lte("transaction_date", end);
    }

    const { data: transactions, error } = await query;
    if (error) throw error;

    // Filter in JS to simplify complex tag logic for both auto_kids and kids_management
    const filtered = (transactions || []).filter(tx => {
      const tags = tx.tags || [];
      const isKidTx = tags.includes("auto_kids") || tags.includes("kids_management") || tags.includes("kid_self_expense") || tags.includes("from_parent");
      if (!isKidTx) return false;
      
      // Gastos da própria criança (kid_self_expense) são informativos para o pai
      // Não entram nos cálculos de saldo do pai porque não têm user_id do pai diretamente impactando caixa
      // A menos que explicitamente configurado.
      
      if (dependentId) return tags.includes(`dependente:${dependentId}`) || (tx as any).dependent_id === dependentId;
      return true;
    });

    return filtered;
  });
