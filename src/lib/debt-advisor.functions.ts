import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getDebtAdvisorInsights = createServerFn({ method: "GET" })
  .inputValidator(z.object({ userId: z.string() }))
  .handler(async ({ data }) => {
    const { userId } = data;

    // 1. Busca transações e compromissos (tabelas que sabemos que existem)
    const [transactionsRes, commitmentsRes] = await Promise.all([
      supabaseAdmin.from("transactions").select("*").eq("user_id", userId).is("deleted_at", null),
      supabaseAdmin.from("commitments").select("*").eq("user_id", userId).eq("status", "open"),
    ]);

    const txs = transactionsRes.data || [];
    const commitments = (commitmentsRes.data || []) as any[];

    // Tenta buscar cartões (se a migração já refletiu nos tipos, senão usamos consulta crua ou ignoramos erro de tipo)
    // Para evitar erros de build se os tipos não atualizaram, usamos 'any'
    const cardsRes = await (supabaseAdmin.from("credit_cards") as any).select("*").eq("user_id", userId);
    const cards = (cardsRes.data || []) as any[];

    // Cálculo básico de saúde financeira
    const totalIncome = txs.filter(t => t.transaction_type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const totalExpense = txs.filter(t => t.transaction_type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
    
    // Compromissos pendentes
    const totalDebt = commitments.reduce((s, c) => s + (Number(c.total_amount) - Number(c.paid_amount || 0)), 0);
    
    // Análise de cartões
    const cardDebt = cards.reduce((s, c) => s + Number(c.current_balance || 0), 0);

    const plans = [];

    // Lógica de sugestão
    if (totalDebt > 0 || cardDebt > 0) {
      const combinedDebt = totalDebt + cardDebt;
      const surplus = totalIncome - totalExpense;
      const monthsToPay = surplus > 0 ? Math.ceil(combinedDebt / surplus) : 99;
      
      plans.push({
        title: "Plano de Quitação GastoCerto",
        description: surplus > 0 
          ? `Com sua sobra de ${surplus.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}, você quita tudo em aprox. ${monthsToPay} meses.`
          : "Seu orçamento está apertado. Precisamos reduzir gastos para gerar sobra e pagar as dívidas.",
        steps: [
          "Elimine gastos não essenciais (Lazer, Assinaturas) imediatamente.",
          "Priorize o pagamento do rotativo do Cartão de Crédito (Juros mais altos).",
          "Tente renegociar prazos de empréstimos e financiamentos.",
          `Objetivo: Economizar R$ ${Math.max(200, combinedDebt * 0.05).toFixed(2)} extras por mês.`
        ]
      });
    }

    return {
      summary: {
        totalDebt: totalDebt + cardDebt,
        cardDebt,
        debtToIncomeRatio: totalIncome > 0 ? ((totalDebt + cardDebt) / totalIncome) * 100 : 0,
        healthScore: (totalDebt + cardDebt) === 0 ? 100 : Math.max(0, 100 - ((totalDebt + cardDebt) / (Math.max(1, totalIncome) * 12)) * 100)
      },
      plans
    };
  });
