import { createFileRoute } from '@tanstack/react-router'
import { supabase } from "@/integrations/supabase/client"

export const Route = createFileRoute('/api/public/mercadopago-pix')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json()
        
        // Simulação de Webhook Mercado Pago
        // Em prod, validar assinatura X-Signature
        const paymentId = body.data?.id || body.resource?.split('/').pop()
        const status = body.action === 'payment.updated' ? 'approved' : 'pending'

        if (paymentId && status === 'approved') {
          // 1. Atualizar transação PIX
          const { data: pix, error: pixErr } = await supabase
            .from("pix_transactions")
            .update({ status: 'approved', updated_at: new Date().toISOString() })
            .eq("mercadopago_payment_id", paymentId)
            .select()
            .single()

          if (pix && !pixErr) {
            // 2. Registrar no Ledger (Razão)
            await supabase.from("ledger_entries").insert({
              user_id: pix.user_id,
              dependent_id: pix.recipient_id,
              pix_transaction_id: pix.id,
              type: 'credit',
              amount: pix.amount,
              description: `PIX Recebido: ${pix.description || 'Transferência'}`
            })

            // 3. Opcional: Criar transação financeira real se for para dependente
            if (pix.recipient_id) {
               // ... lógica de crédito no saldo da criança
            }
          }
        }

        return new Response('ok')
      }
    }
  }
})
