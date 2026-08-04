import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const requestSchema = z.object({
  code: z.string().trim().min(4).max(32),
  password: z.string().min(4).max(30),
})

export const Route = createFileRoute('/api/public/external-verify')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = requestSchema.safeParse(await request.json().catch(() => null))
        if (!parsed.success) {
          return Response.json({ error: 'Dados de acesso inválidos' }, { status: 400 })
        }

        const { code, password } = parsed.data
        const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
        const admin = supabaseAdmin as any
        
        const { data: codeData, error } = await admin.rpc('verify_external_access', { p_code: code.toUpperCase() })
          .single()

        if (error || !codeData) {
          return new Response(JSON.stringify({ error: 'Código inválido ou expirado' }), { status: 401 })
        }

        const { verifySharePassword } = await import('@/lib/share-hash.server')
        const passwordMatches = await verifySharePassword(
          password,
          (codeData as any).password_hash,
          (codeData as any).password_salt,
        )

        if (!passwordMatches) {
          // Log failed attempt
          await admin.from('external_access_logs').insert({
            code_id: (codeData as any).id,
            action: 'failed_attempt',
            ip_address: request.headers.get('x-forwarded-for') || '0.0.0.0',
            user_agent: request.headers.get('user-agent')
          })
          return new Response(JSON.stringify({ error: 'Senha incorreta' }), { status: 401 })
        }

        // Log successful login
        await admin.from('external_access_logs').insert({
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
