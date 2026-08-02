import { createFileRoute } from '@tanstack/react-router'
import { supabaseAdmin } from '@/integrations/supabase/client.server'

export const Route = createFileRoute('/api/public/external-verify')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { code, password } = await request.json()
        
        const { data: codeData, error } = await (supabaseAdmin.rpc as any)('verify_external_access', { p_code: code.toUpperCase() })
          .single()

        if (error || !codeData) {
          return new Response(JSON.stringify({ error: 'Código inválido ou expirado' }), { status: 401 })
        }

        const { hashSharePassword } = await import('@/lib/share-hash.server')
        const { hash } = await (hashSharePassword as any)(password, (codeData as any).password_salt)

        if (hash !== (codeData as any).password_hash) {
          // Log failed attempt
          await (supabaseAdmin.from('external_access_logs') as any).insert({
            code_id: (codeData as any).id,
            action: 'failed_attempt',
            ip_address: request.headers.get('x-forwarded-for') || '0.0.0.0',
            user_agent: request.headers.get('user-agent')
          })
          return new Response(JSON.stringify({ error: 'Senha incorreta' }), { status: 401 })
        }

        // Log successful login
        await (supabaseAdmin.from('external_access_logs') as any).insert({
          code_id: (codeData as any).id,
          action: 'login',
          ip_address: request.headers.get('x-forwarded-for') || '0.0.0.0',
          user_agent: request.headers.get('user-agent')
        })

        return new Response(JSON.stringify({ 
          success: true, 
          token: code,
          permissions: (codeData as any).permissions 
        }))
      }
    }
  }
})
