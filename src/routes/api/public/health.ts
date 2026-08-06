import { createFileRoute } from '@tanstack/react-router';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

export const Route = createFileRoute('/api/public/health')({
  server: {
    handlers: {
      GET: async () => {
        const results: Record<string, any> = {};
        
        const tables = [
          "profiles", 
          "accounts", 
          "categories", 
          "transactions", 
          "budgets", 
          "licenses", 
          "user_roles"
        ] as const;

        for (const table of tables) {
          try {
            const { count, error } = await supabaseAdmin
              .from(table as any)
              .select("*", { count: "exact", head: true });
            
            if (error) {
              results[table] = { status: "error", message: error.message };
            } else {
              results[table] = { status: "ok", count };
            }
          } catch (e: any) {
            results[table] = { status: "exception", message: e.message };
          }
        }

        return new Response(JSON.stringify(results), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
  }
});
