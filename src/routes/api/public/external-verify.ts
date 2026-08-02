import { createFileRoute } from '@tanstack/react-router'
import { supabaseAdmin } from '@/integrations/supabase/client.server'

export const Route = createFileRoute('/api/public/external-verify')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { code, password } = await request.json()
        
        // Use RPC or direct query via admin to check code + password
        // In a real app, we should verify the hash here.
        // For simplicity in this turn, we'll return the verification status.
        
        const { data: codeData, error } = await supabaseAdmin
          .rpc('verify_external_access', { p_code: code.toUpperCase() })
          .single()

        if (error || !codeData) {
          return new Response(JSON.stringify({ error: 'Código inválido ou expirado' }), { status: 401 })
        }

        const { hashSharePassword } = await import('@/lib/share-hash.server')
        const { hash } = await hashSharePassword(password, codeData.password_salt)

        if (hash !== codeData.password_hash) {
          // Log failed attempt
          await supabaseAdmin.from('external_access_logs').insert({
            code_id: codeData.id,
            action: 'failed_attempt',
            ip_address: request.headers.get('x-forwarded-for') || '0.0.0.0',
            user_agent: request.headers.get('user-agent')
          })
          return new Response(JSON.stringify({ error: 'Senha incorreta' }), { status: 401 })
        }

        // Log successful login
        await supabaseAdmin.from('external_access_logs').insert({
          code_id: codeData.id,
          action: 'login',
          ip_address: request.headers.get('x-forwarded-for') || '0.0.0.0',
          user_agent: request.headers.get('user-agent')
        })

        return new Response(JSON.stringify({ 
          success: true, 
          token: code,
          permissions: codeData.permissions 
        }))
      }
    }
  }
})
