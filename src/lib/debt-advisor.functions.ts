import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getDebtAdvisorInsights = createServerFn({ method: "GET" })
  .inputValidator(z.object({ userId: z.string() }))
  .handler(async ({ data }) => {
    const { userId } = data;

    // 1. Busca transações (gastos vs receitas), dívidas (compromissos) e cartões
    const [transactionsRes, commitmentsRes, cardsRes] = await Promise.all([
      supabaseAdmin.from("transactions").select("*").eq("user_id", userId).eq("status", "pending").is("deleted_at", null),
      supabaseAdmin.from("commitments").select("*").eq("user_id", userId).eq("status", "open"),
      supabaseAdmin.from("credit_cards").select("*").eq("user_id", userId),
    ]);

    const txs = transactionsRes.data || [];
    const commitments = commitmentsRes.data || [];
    const cards = cardsRes.data || [];

    // Cálculo básico de saúde financeira
    const totalIncome = txs.filter(t => t.transaction_type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const totalExpense = txs.filter(t => t.transaction_type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
    const totalDebt = commitments.reduce((s, c) => s + (Number(c.total_amount) - Number(c.paid_amount || 0)), 0);
    
    // Análise de cartões (gastos nos cartões vs limite se disponível)
    const cardDebt = cards.reduce((s, c) => s + Number(c.current_balance || 0), 0);

    const plans = [];

    // Lógica de sugestão
    if (totalDebt > 0) {
      const monthsToPay = totalIncome > totalExpense ? Math.ceil(totalDebt / (totalIncome - totalExpense)) : 99;
      
      plans.push({
        title: "Plano de Quitação Acelerada",
        description: `Com base na sua sobra atual, você pode quitar todas as dívidas em aproximadamente ${monthsToPay > 24 ? 'mais de 2 anos' : monthsToPay + ' meses'}.`,
        steps: [
          "Elimine gastos supérfluos IMEDIATAMENTE.",
          "Negocie taxas de juros com os credores das dívidas maiores.",
          "Pague primeiro as dívidas com juros mais altos (Cartão de Crédito).",
          `Reserve R$ ${Math.max(100, (totalIncome - totalExpense) * 0.8).toFixed(2)} por mês exclusivamente para dívidas.`
        ]
      });
    }

    if (cardDebt > (totalIncome * 0.3)) {
      plans.push({
        title: "Alerta de Uso de Cartão",
        description: "Seu endividamento em cartões ultrapassa 30% da sua renda. Isso é um sinal de alerta crítico.",
        steps: [
          "Pare de usar os cartões para compras parceladas.",
          "Consolide a dívida do cartão em um empréstimo com juros menores, se possível.",
          "Use apenas débito para controle psicológico de gastos."
        ]
      });
    }

    return {
      summary: {
        totalDebt,
        cardDebt,
        debtToIncomeRatio: totalIncome > 0 ? (totalDebt / totalIncome) * 100 : 0,
        healthScore: totalDebt === 0 ? 100 : Math.max(0, 100 - (totalDebt / (totalIncome * 12)) * 100)
      },
      plans
    };
  });
