import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/lib/integrations/supabase/client.server";

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

    return { success: true, transactionId: parentTx.id };
  });

export const getKidsFinancialMetrics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({
      dependentId: z.string().uuid().optional(),
      month: z.number().optional(),
      year: z.number().optional(),
      page: z.number().optional().default(1),
      pageSize: z.number().optional().default(20),
      // Filtros do histórico do painel dos pais
      kind: z.string().optional(), // "all" | "sent" | "kidExpense" | "kidIncome"
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }).parse(data)
  )
  .handler(async ({ data, context }) => {
    const userId = context.userId;
    const { dependentId, month, year, page, pageSize, kind, startDate, endDate } = data;

    const useRange = Boolean(startDate && endDate);
    const start = useRange
      ? startDate!
      : year && month
        ? `${year}-${String(month).padStart(2, "0")}-01`
        : null;
    const end = useRange
      ? `${endDate!}T23:59:59`
      : year && month
        ? `${new Date(year, month, 0).toISOString().split("T")[0]}T23:59:59`
        : null;

    // Current period query
    let query = supabaseAdmin
      .from("transactions")
      .select("id, amount, description, transaction_date, tags, transaction_type, status", { count: "exact" })
      .eq("user_id", userId)
      .is("deleted_at", null);

    if (start && end) {
      query = query.gte("transaction_date", start).lte("transaction_date", end);
    }


    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    const { data: transactions, error, count } = await query
      .order("transaction_date", { ascending: false })
      .range(from, to);

    if (error) throw error;

    // Previous period query (for comparison)
    let prevTransactions: any[] = [];
    if (month && year) {
      const prevDate = new Date(year, month - 2, 1);
      const prevMonth = prevDate.getMonth() + 1;
      const prevYear = prevDate.getFullYear();
      const prevStart = `${prevYear}-${String(prevMonth).padStart(2, "0")}-01`;
      const prevEnd = `${new Date(prevYear, prevMonth, 0).toISOString().split("T")[0]}T23:59:59`;

      const { data: prevData } = await supabaseAdmin
        .from("transactions")
        .select("id, amount, transaction_type, tags")
        .eq("user_id", userId)
        .is("deleted_at", null)
        .gte("transaction_date", prevStart)
        .lte("transaction_date", prevEnd);
      
      prevTransactions = prevData || [];
    }

    const parentRows = (transactions || []).filter(tx => {
      const tags = tx.tags || [];
      const isKidTx = (tags.includes("auto_kids") || tags.includes("kids_management") || tags.includes("from_parent")) 
                    && !tags.includes("kid_self_expense");
      
      if (!isKidTx) return false;
      if (dependentId) return tags.includes(`dependente:${dependentId}`) || (tx as any).dependent_id === dependentId;
      return true;
    });

    let kidsQuery = supabaseAdmin
      .from("dependents")
      .select("id, name, kid_user_id")
      .eq("user_id", userId)
      .not("kid_user_id", "is", null);
    if (dependentId) kidsQuery = kidsQuery.eq("id", dependentId);

    const { data: kids } = await kidsQuery;
    const kidMap = new Map<string, { dependentId: string; name: string }>();
    for (const kid of kids ?? []) {
      if (kid.kid_user_id) kidMap.set(kid.kid_user_id, { dependentId: kid.id, name: kid.name });
    }

    let kidRows: typeof parentRows = [];
    let prevKidRows: any[] = [];
    
    if (kidMap.size > 0) {
      let selfQuery = supabaseAdmin
        .from("transactions")
        .select("id, amount, description, transaction_date, tags, transaction_type, status, user_id")
        .in("user_id", [...kidMap.keys()])
        .is("deleted_at", null);

      if (start && end) {
        selfQuery = selfQuery.gte("transaction_date", start).lte("transaction_date", end);
      }

      const { data: selfRows } = await selfQuery.order("transaction_date", { ascending: false }).range(from, to);

      kidRows = (selfRows ?? [])
        .filter((tx) => {
          const tags = tx.tags ?? [];
          return !tags.includes("from_parent") && !tags.some((t) => t.startsWith("origin:"));
        })
        .map((tx) => {
          const kid = kidMap.get((tx as any).user_id as string);
          const tags = new Set(tx.tags ?? []);
          tags.add("kid_self_expense");
          if (kid) tags.add(`dependente:${kid.dependentId}`);
          return {
            id: tx.id,
            amount: Number(tx.amount),
            description: tx.description,
            transaction_date: tx.transaction_date,
            transaction_type: tx.transaction_type,
            status: tx.status,
            tags: [...tags],
          } as (typeof parentRows)[number];
        });

      // Previous period for kids self transactions
      if (month && year) {
        const prevDate = new Date(year, month - 2, 1);
        const prevMonth = prevDate.getMonth() + 1;
        const prevYear = prevDate.getFullYear();
        const prevStart = `${prevYear}-${String(prevMonth).padStart(2, "0")}-01`;
        const prevEnd = `${new Date(prevYear, prevMonth, 0).toISOString().split("T")[0]}T23:59:59`;

        const { data: prevSelfRows } = await supabaseAdmin
          .from("transactions")
          .select("id, amount, transaction_type, tags, user_id")
          .in("user_id", [...kidMap.keys()])
          .is("deleted_at", null)
          .gte("transaction_date", prevStart)
          .lte("transaction_date", prevEnd);
        
        prevKidRows = (prevSelfRows || []).filter(tx => {
          const tags = tx.tags ?? [];
          return !tags.includes("from_parent") && !tags.some((t) => t.startsWith("origin:"));
        });
      }
    }

    // Comparison summary
    const summary = {
      current: {
        sent: parentRows.filter(t => t.transaction_type === 'expense').reduce((acc, t) => acc + t.amount, 0),
        spent: kidRows.filter(t => t.transaction_type === 'expense').reduce((acc, t) => acc + t.amount, 0)
      },
      previous: {
        sent: prevTransactions.filter(tx => {
          const tags = tx.tags || [];
          const isKidTx = (tags.includes("auto_kids") || tags.includes("kids_management") || tags.includes("from_parent")) 
                        && !tags.includes("kid_self_expense");
          if (!isKidTx) return false;
          if (dependentId) return tags.includes(`dependente:${dependentId}`);
          return true;
        }).reduce((acc, t) => acc + t.amount, 0),
        spent: prevKidRows.filter(t => t.transaction_type === 'expense').reduce((acc, t) => acc + t.amount, 0)
      }
    };

    // Nome de cada filho por lançamento (para o painel dos pais exibir com clareza)
    const { data: allDeps } = await supabaseAdmin
      .from("dependents")
      .select("id, name, nickname")
      .eq("user_id", userId);
    const nameById = new Map<string, string>();
    for (const d of allDeps ?? []) nameById.set(d.id, (d.nickname || d.name) as string);

    const withKid = [...parentRows, ...kidRows].map((tx) => {
      const tags: string[] = (tx as any).tags ?? [];
      const depTag = tags.find((t) => t.startsWith("dependente:"));
      const depId = depTag ? depTag.split(":")[1] : null;
      const isKidExpense = tags.includes("kid_self_expense");
      return {
        ...tx,
        dependentId: depId,
        kidName: depId ? nameById.get(depId) ?? null : null,
        entryKind: isKidExpense
          ? (tx.transaction_type === "income" ? "kidIncome" : "kidExpense")
          : "sent",
      };
    });

    const filtered = kind && kind !== "all" ? withKid.filter((tx) => tx.entryKind === kind) : withKid;

    return {
      transactions: filtered.sort((a, b) => b.transaction_date.localeCompare(a.transaction_date)),
      totalCount: count || 0,
      summary
    };
  });

