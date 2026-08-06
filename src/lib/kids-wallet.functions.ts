import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/integrations/supabase/auth-middleware";

export type KidWallet = {
  dependentId: string;
  name: string;
  nickname: string | null;
  hasAccess: boolean;
  monthlyAllowance: number;
  monthlyLimit: number;
  received: number;
  spent: number;
  balance: number;
  monthReceived: number;
  monthSpent: number;
  lastMovementAt: string | null;
};

/** Saldo em carteira e gastos (tempo real) de cada filho do responsável logado. */
export const getKidsWalletOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({ month: z.number().optional(), year: z.number().optional() })
      .parse(data ?? {})
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const now = new Date();
    const month = data.month ?? now.getMonth() + 1;
    const year = data.year ?? now.getFullYear();
    const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
    const monthEnd = `${year}-${String(month).padStart(2, "0")}-${String(
      new Date(year, month, 0).getDate()
    ).padStart(2, "0")}`;

    const { data: deps, error: depsError } = await supabase
      .from("dependents")
      .select("id, name, nickname, kid_user_id, monthly_allowance, monthly_limit, active")
      .eq("user_id", userId)
      .order("name", { ascending: true });
    if (depsError) throw depsError;

    const dependents = (deps ?? []).filter((d) => d.active !== false);
    if (dependents.length === 0) {
      return { wallets: [] as KidWallet[], month, year };
    }

    const kidUserIds = dependents
      .map((d) => d.kid_user_id)
      .filter((id): id is string => Boolean(id));

    // Envios do responsável para os filhos (etiquetados por dependente).
    const { data: parentRows } = await supabase
      .from("transactions")
      .select("amount, transaction_type, transaction_date, tags")
      .eq("user_id", userId)
      .is("deleted_at", null);

    // Lançamentos feitos pelas próprias crianças.
    let kidRows: {
      amount: number;
      transaction_type: string;
      transaction_date: string;
      tags: string[] | null;
      user_id: string;
    }[] = [];
    if (kidUserIds.length > 0) {
      const { data: rows } = await supabase
        .from("transactions")
        .select("amount, transaction_type, transaction_date, tags, user_id")
        .in("user_id", kidUserIds)
        .is("deleted_at", null);
      kidRows = (rows ?? []) as typeof kidRows;
    }

    const wallets: KidWallet[] = dependents.map((dep) => {
      const tag = `dependente:${dep.id}`;
      let received = 0;
      let spent = 0;
      let monthReceived = 0;
      let monthSpent = 0;
      let lastMovementAt: string | null = null;

      const track = (date: string) => {
        if (!lastMovementAt || date > lastMovementAt) lastMovementAt = date;
      };
      const inMonth = (date: string) => date >= monthStart && date <= monthEnd;

      for (const row of parentRows ?? []) {
        const tags = row.tags ?? [];
        if (!tags.includes(tag)) continue;
        if (tags.includes("kid_self_expense")) continue;
        if (row.transaction_type !== "expense") continue;
        const amount = Number(row.amount) || 0;
        received += amount;
        if (inMonth(row.transaction_date)) monthReceived += amount;
        track(row.transaction_date);
      }

      const kidUserId = dep.kid_user_id;
      for (const row of kidRows) {
        if (!kidUserId || row.user_id !== kidUserId) continue;
        const tags = row.tags ?? [];
        const isMirror =
          tags.includes("from_parent") || tags.some((t) => t.startsWith("origin:"));
        const amount = Number(row.amount) || 0;
        if (row.transaction_type === "income") {
          // Espelhos de envio já foram contados via lançamento do responsável.
          if (isMirror) continue;
          received += amount;
          if (inMonth(row.transaction_date)) monthReceived += amount;
        } else if (row.transaction_type === "expense") {
          spent += amount;
          if (inMonth(row.transaction_date)) monthSpent += amount;
        } else {
          continue;
        }
        track(row.transaction_date);
      }

      return {
        dependentId: dep.id,
        name: dep.name,
        nickname: dep.nickname ?? null,
        hasAccess: Boolean(dep.kid_user_id),
        monthlyAllowance: Number(dep.monthly_allowance ?? 0),
        monthlyLimit: Number(dep.monthly_limit ?? 0),
        received: Math.round(received * 100) / 100,
        spent: Math.round(spent * 100) / 100,
        balance: Math.round((received - spent) * 100) / 100,
        monthReceived: Math.round(monthReceived * 100) / 100,
        monthSpent: Math.round(monthSpent * 100) / 100,
        lastMovementAt,
      };
    });

    return { wallets, month, year };
  });
