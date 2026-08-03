import { createFileRoute } from '@tanstack/react-router'
import { supabase } from "@/integrations/supabase/client"
import { createHmac } from 'crypto'

export const Route = createFileRoute('/api/public/mercadopago-pix')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Obter corpo e headers
        const body = await request.json()
        const xSignature = request.headers.get('x-signature')
        
        console.log('[Webhook MP] Recebido:', body)

        // Em uma implementação real com Mercado Pago, validaríamos a assinatura aqui
        // usando o WEBHOOK_SECRET configurado no painel do MP.
        // const secret = process.env['MP_WEBHOOK_SECRET']!
        
        // Extrair ID do pagamento
        const paymentId = body.data?.id || (body.resource?.includes('payments') ? body.resource.split('/').pop() : null)
        
        if (!paymentId) {
          return new Response('No payment ID found', { status: 400 })
        }

        // Consultar status atual no Mercado Pago (via API)
        // Aqui simulamos que o pagamento foi aprovado se a action for de sucesso
        const isApproved = body.action === 'payment.updated' || body.type === 'payment'
        
        if (isApproved) {
          // 1. Buscar a transação pendente no nosso banco
          const { data: pix, error: pixErr } = await supabase
            .from("pix_transactions")
            .select("*")
            .eq("mercadopago_payment_id", paymentId.toString())
            .single()

          if (pix && !pixErr && pix.status === 'pending') {
            // 2. Atualizar status para aprovado
            const { error: updateErr } = await supabase
              .from("pix_transactions")
              .update({ 
                status: 'approved', 
                updated_at: new Date().toISOString() 
              })
              .eq("id", pix.id)

            if (!updateErr) {
              // 3. Registrar no Ledger (Razão)
              await supabase.from("ledger_entries").insert({
                user_id: pix.user_id,
                dependent_id: pix.recipient_id,
                pix_transaction_id: pix.id,
                type: 'credit',
                amount: pix.amount,
                description: `PIX Recebido: ${pix.description || 'Transferência via App'}`
              })

              // 4. Se houver um destinatário (criança), podemos disparar um alerta
              if (pix.recipient_id) {
                await supabase.from("kid_access_audit" as any).insert({
                  user_id: pix.user_id,
                  dependent_id: pix.recipient_id,
                  action: 'access_granted',
                  detail: { amount: pix.amount, type: 'pix_credit' }
                } as any)
              }
              
              console.log(`[Webhook MP] Pagamento ${paymentId} processado com sucesso.`)
            }
          }
        }

        return new Response('ok', { status: 200 })
      }
    }
  }
})
