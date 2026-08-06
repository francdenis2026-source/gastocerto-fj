import { createFileRoute } from '@tanstack/react-router'
import { purgeExpiredTrash } from '@/lib/admin-trash.functions'
import { adminAutoPurgeLogs } from '@/lib/admin-ops.functions'

export const Route = createFileRoute('/api/public/cron')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const result = await purgeExpiredTrash()
          
          // Limpeza automática de logs baseada em retenção (ex: 90 dias)
          const logsResult = await adminAutoPurgeLogs({ data: { retentionDays: 90 } })

          return new Response(JSON.stringify({ 
            message: 'Cron job executed successfully', 
            purged: result.purged,
            purged_logs: logsResult.count,
            timestamp: new Date().toISOString()
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          })
        } catch (error) {
          console.error('Cron job failed:', error)
          return new Response(JSON.stringify({ error: 'Internal Server Error' }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          })
        }
      }
    }
  }
})
