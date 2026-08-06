import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type CreditCard = {
  id: string;
  user_id: string;
  name: string;
  institution: string | null;
  last_digits: string | null;
  limit_amount: number;
  current_balance: number;
  due_day: number | null;
  closing_day: number | null;
  color: string | null;
  icon: string | null;
  active: boolean;
};

export type CardTransaction = {
  id: string;
  card_id: string;
  user_id: string;
  category_id: string | null;
  amount: number;
  description: string | null;
  transaction_date: string;
  installments_total: number;
  installment_current: number;
};

export const getCreditCards = createServerFn({ method: "GET" })
  .inputValidator(z.object({ userId: z.string() }))
  .handler(async ({ data }) => {
    const { data: cards, error } = await supabaseAdmin
      .from("credit_cards")
      .select("*")
      .eq("user_id", data.userId)
      .eq("active", true)
      .order("name");
    
    if (error) throw error;
    return cards as CreditCard[];
  });

export const saveCreditCard = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    id: z.string().optional(),
    user_id: z.string(),
    name: z.string(),
    institution: z.string().optional(),
    limit_amount: z.number().default(0),
    due_day: z.number().min(1).max(31).optional(),
    closing_day: z.number().min(1).max(31).optional(),
    color: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    const { id, ...payload } = data;
    if (id) {
      const { data: card, error } = await supabaseAdmin
        .from("credit_cards")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return card as CreditCard;
    } else {
      const { data: card, error } = await supabaseAdmin
        .from("credit_cards")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return card as CreditCard;
    }
  });

export const saveCardTransaction = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    card_id: z.string(),
    user_id: z.string(),
    amount: z.number(),
    description: z.string(),
    category_id: z.string().optional(),
    transaction_date: z.string().optional(),
    installments_total: z.number().default(1),
  }))
  .handler(async ({ data }) => {
    // Verificação de duplicados (mesmo valor, data e descrição similar)
    const txDate = data.transaction_date || new Date().toISOString().split('T')[0];
    const { data: existing } = await supabaseAdmin
      .from("card_transactions")
      .select("id")
      .eq("card_id", data.card_id)
      .eq("amount", data.amount)
      .eq("transaction_date", txDate)
      .ilike("description", `%${data.description}%`)
      .limit(1);

    if (existing && existing.length > 0) {
      throw new Error("Provável lançamento duplicado detectado (mesmo valor, data e descrição).");
    }

    const { data: tx, error } = await supabaseAdmin
      .from("card_transactions")
      .insert({
        ...data,
        transaction_date: data.transaction_date || new Date().toISOString().split('T')[0]
      })
      .select()
      .single();
    
    if (error) throw error;

    // Atualiza o saldo do cartão via raw query para evitar erros de tipo temporários
    await (supabaseAdmin as any).rpc("increment_card_balance", { 
      card_id_param: data.card_id, 
      amount_param: data.amount 
    });

    return tx as CardTransaction;
  });

export const getCardTransactions = createServerFn({ method: "GET" })
  .inputValidator(z.object({ cardId: z.string() }))
  .handler(async ({ data }) => {
    const { data: txs, error } = await supabaseAdmin
      .from("card_transactions")
      .select("*")
      .eq("card_id", data.cardId)
      .order("transaction_date", { ascending: false });
    
    if (error) throw error;
    return txs as CardTransaction[];
  });

export const exportCardAuditLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ 
    cardId: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional()
  }))
  .handler(async ({ data, context }) => {
    // Busca logs de auditoria relacionados a cartões
    let query = supabaseAdmin
      .from("admin_logs" as any)
      .select("*")
      .eq("user_id", context.userId) // Filtro por usuário dono dos cartões
      .ilike("action", "%card%");

    if (data.cardId) {
      query = query.filter("details->>card_id", "eq", data.cardId);
    }
    if (data.from) query = query.gte("created_at", data.from);
    if (data.to) query = query.lte("created_at", data.to);

    const { data: logs, error } = await query.order("created_at", { ascending: false });
    if (error) throw error;
    return logs;
  });
