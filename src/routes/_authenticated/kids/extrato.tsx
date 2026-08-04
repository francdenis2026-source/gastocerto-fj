import { createFileRoute } from '@tanstack/react-router'
import { Baby, Ghost, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/kids/extrato')({
  beforeLoad: () => {
    // Força o erro 404 HTTP no nível de rede/servidor
    throw new Response("Página não encontrada no Espaço Kids", { status: 404 });
  },
  component: KidNotFound
})

function KidNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
      <div className="relative mb-6">
        <div className="absolute -inset-4 rounded-full bg-brand/10 blur-xl animate-pulse" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-card border-2 border-brand/20 shadow-xl">
          <Ghost className="h-12 w-12 text-brand animate-bounce" />
        </div>
        <Baby className="absolute -bottom-1 -right-1 h-8 w-8 text-amber-500 drop-shadow-md" />
      </div>
      
      <h1 className="mb-2 text-2xl font-bold tracking-tight text-foreground">
        Ops! Caminho Perdido
      </h1>
      <p className="mb-8 max-w-xs text-sm text-muted-foreground">
        Parece que este brinquedo não está aqui. O Espaço Kids ainda está sendo organizado com carinho!
      </p>

      <div className="flex flex-col gap-3 w-full max-w-[200px]">
        <Button asChild className="gap-2 bg-brand hover:bg-brand/90 shadow-lg shadow-brand/20">
          <Link to="/painel">
            <Home className="h-4 w-4" />
            Voltar ao Início
          </Link>
        </Button>
        <div className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest">
          Erro 404 · Acesso Restrito
        </div>
      </div>
    </div>
  )
}
