import { useNavigate } from "@tanstack/react-router";
import { Plus, Search, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { allNavTargets, navSections } from "@/lib/nav-model";
import { cn } from "@/lib/utils";

type QuickAction = (kind: "expense" | "income") => void;

/**
 * Busca rápida (Ctrl/Cmd + K) de toda a área do cliente.
 *
 * Resolve dois problemas reais do app: (1) rotas de detalhe que só eram
 * alcançáveis por link dentro de outra tela e (2) o custo de encontrar uma
 * seção específica em um menu com dezenas de páginas.
 */
export function CommandPalette({
  onQuickEntry,
  variant = "field",
}: {
  onQuickEntry?: QuickAction;
  /** "field" = campo na sidebar; "icon" = botão compacto no header. */
  variant?: "field" | "icon";
}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isCombo = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (!isCombo) return;
      event.preventDefault();
      setOpen((prev) => !prev);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const targets = useMemo(() => allNavTargets(navSections), []);
  const grouped = useMemo(() => {
    const map = new Map<string, typeof targets>();
    for (const target of targets) {
      const list = map.get(target.group) ?? [];
      list.push(target);
      map.set(target.group, list);
    }
    return [...map.entries()];
  }, [targets]);

  function go(to: string) {
    setOpen(false);
    navigate({ to: to as never });
  }

  return (
    <>
      {variant === "icon" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Buscar telas e ações"
          title="Buscar (Ctrl+K)"
          className="grid size-8 shrink-0 place-items-center rounded-md border border-border bg-secondary/50 text-muted-foreground transition-colors hover:text-foreground sm:size-9"
        >
          <Search className="size-4" aria-hidden="true" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Buscar telas e ações"
          className={cn(
            "group flex h-9 w-full items-center gap-2 rounded-xl border border-border bg-secondary/50 px-2.5 text-left text-[12px] text-muted-foreground transition-colors hover:border-brand/40 hover:text-foreground",
          )}
        >
          <Search className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">Buscar…</span>
          <kbd className="ml-auto hidden shrink-0 rounded-md border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] font-semibold lg:inline">
            ⌘K
          </kbd>
        </button>
      )}

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Buscar tela, relatório ou ação…" />
        <CommandList>
          <CommandEmpty>Nada encontrado.</CommandEmpty>
          {onQuickEntry ? (
            <>
              <CommandGroup heading="Ações rápidas">
                <CommandItem
                  value="adicionar despesa gasto lançar"
                  onSelect={() => {
                    setOpen(false);
                    onQuickEntry("expense");
                  }}
                >
                  <TrendingDown className="mr-2 size-4 text-destructive" />
                  Adicionar despesa
                </CommandItem>
                <CommandItem
                  value="adicionar receita entrada salário"
                  onSelect={() => {
                    setOpen(false);
                    onQuickEntry("income");
                  }}
                >
                  <TrendingUp className="mr-2 size-4 text-success" />
                  Adicionar receita
                </CommandItem>
                <CommandItem value="adicionar fixo assinatura recorrente" onSelect={() => go("/recorrencia")}>
                  <Plus className="mr-2 size-4 text-brand" />
                  Adicionar gasto fixo
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
            </>
          ) : null}

          {grouped.map(([group, items]) => (
            <CommandGroup key={group} heading={group}>
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.key}
                    value={`${item.label} ${item.group} ${item.section} ${item.keywords ?? ""}`}
                    onSelect={() => go(item.to)}
                  >
                    <Icon className="mr-2 size-4 text-brand" aria-hidden="true" />
                    <span className="truncate">{item.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
