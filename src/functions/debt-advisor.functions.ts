import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/integrations/supabase/client.server";

export const getDebtAdvisorInsights = createServerFn({ method: "GET" })
  .inputValidator(z.object({ userId: z.string() }))
  .handler(async ({ data }) => {
    const { userId } = data;

    // 1. Busca transações, compromissos e cartões
    const [transactionsRes, commitmentsRes, cardsRes] = await Promise.all([
      supabaseAdmin.from("transactions").select("*").eq("user_id", userId).is("deleted_at", null),
      supabaseAdmin.from("commitments").select("*").eq("user_id", userId).eq("status", "open"),
      supabaseAdmin.from("credit_cards").select("*").eq("user_id", userId).eq("active", true),
    ]);

    const txs = transactionsRes.data || [];
    const commitments = (commitmentsRes.data || []) as any[];
    const cards = (cardsRes.data || []) as any[];

    // Cálculo básico de saúde financeira (últimos 30 dias para base de renda/gasto)
    const totalIncome = txs.filter(t => t.transaction_type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const totalExpense = txs.filter(t => t.transaction_type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
    
    // Compromissos pendentes (parcelas, fiados, etc)
    const totalDebt = commitments.reduce((s, c) => s + (Number(c.total_amount) - Number(c.paid_amount || 0)), 0);
    
    // Dívida de cartões
    const cardDebt = cards.reduce((s, c) => s + Number(c.current_balance || 0), 0);
    const combinedDebt = totalDebt + cardDebt;

    const plans = [];

    // Lógica de sugestão baseada no perfil de dívida
    if (combinedDebt > 0) {
      const surplus = totalIncome - totalExpense;
      const monthsToPay = surplus > 200 ? Math.ceil(combinedDebt / (surplus * 0.7)) : 99; // Usando 70% da sobra
      
      plans.push({
        title: "Plano de Quitação GastoCerto",
        description: surplus > 0 
          ? `Com sua sobra média de ${surplus.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}, estimamos que você possa quitar tudo em aprox. ${monthsToPay} meses focando 70% da sobra mensal para amortização.`
          : "Seu orçamento atual não possui sobra para pagar dívidas. Precisamos gerar um 'superávit' cortando gastos não essenciais.",
        steps: [
          "Elimine gastos não essenciais (Lazer, Streaming não usado) por 3 meses.",
          "Ataque a dívida com maior taxa de juros primeiro (Cartão de Crédito Rotativo).",
          "Tente renegociar o valor total da dívida para pagamento à vista ou parcelas fixas menores.",
          `Objetivo mensal: Destinar R$ ${Math.max(200, surplus * 0.7 || 200).toFixed(2)} exclusivamente para amortizar dívidas.`
        ]
      });
    } else {
      plans.push({
        title: "Sua Saúde Financeira está Excelente!",
        description: "Não identificamos dívidas pendentes ou saldos devedores significativos nos cartões.",
        steps: [
          "Continue mantendo sua reserva de emergência.",
          "Comece a planejar investimentos de longo prazo.",
          "Mantenha o controle rigoroso dos seus gastos fixos."
        ]
      });
    }

    return {
      summary: {
        totalDebt: combinedDebt,
        cardDebt,
        debtToIncomeRatio: totalIncome > 0 ? (combinedDebt / totalIncome) * 100 : 0,
        healthScore: combinedDebt === 0 ? 100 : Math.max(0, 100 - (combinedDebt / (Math.max(1, totalIncome) * 12)) * 100)
      },
      plans
    };
  });
