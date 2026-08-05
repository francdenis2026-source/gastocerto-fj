import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { KeyRound, Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CodeAccessDialog } from "@/components/landing/code-access-dialog";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { handleAnchorClick } from "@/lib/scroll";

const navItems = [
  { label: "Recursos", href: "#recursos" },
  { label: "Planos", href: "#planos" },
  { label: "Segurança", href: "#seguranca" },
  { label: "FAQ", href: "#faq" },
];


export function LandingHeader({ hideActions }: { hideActions?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("#inicio");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = navItems
      .map((item) => document.getElementById(item.href.slice(1)))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(`#${visible.target.id}`);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);


  const [announcementVisible, setAnnouncementVisible] = useState(true);

  return (
    <>
      {announcementVisible && (
        <div className="fixed inset-x-0 top-0 z-[60] flex h-7 items-center justify-center bg-gradient-to-r from-emerald-600/20 to-emerald-500/20 px-4 text-center backdrop-blur-md border-b border-emerald-500/20">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 sm:text-[11px]">
            🎉 Novo: sincronização automática com Pix e cartões — experimente grátis por 7 dias
          </p>
          <button 
            onClick={() => setAnnouncementVisible(false)}
            className="absolute right-2 p-1 text-emerald-400/60 hover:text-emerald-400 transition-colors"
            aria-label="Fechar anúncio"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}
      <header
        className={cn(
          "fixed inset-x-0 z-50 transition-all duration-300",
          announcementVisible ? "top-7" : "top-0",
          scrolled
            ? "border-b border-white/5 bg-background/40 text-foreground backdrop-blur-2xl shadow-sm"
            : "border-b border-transparent bg-transparent text-hero-fg",
        )}
      >
        <div className="section-shell flex h-14 items-center justify-between gap-2 sm:gap-4">
          <Logo onDark={!scrolled} href="#inicio" className="group" />

        <nav aria-label="Navegação principal" className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const isActive = active === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                aria-current={isActive ? "location" : undefined}
                onClick={(event) => handleAnchorClick(event, item.href)}
                className={cn(
                  "nav-underline relative inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent after:bg-hero-accent",
                  isActive && "after:scale-x-100",
                  scrolled
                    ? cn("text-[oklch(0.25_0.04_259)] dark:text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-ring", isActive && "text-foreground font-bold")
                    : cn("text-hero-fg-muted hover:bg-hero-surface-soft hover:text-hero-fg focus-visible:ring-hero-border-strong", isActive && "text-hero-fg"),
                )}

              >
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <ThemeToggle className={cn("inline-flex", !scrolled && "text-hero-fg hover:bg-hero-surface-soft hover:text-hero-fg")} />
          <CodeAccessDialog>
            <Button
              variant="ghost"
              className={cn("hidden lg:inline-flex", !scrolled && "text-hero-fg hover:bg-hero-surface-soft hover:text-hero-fg")}
            >
              <KeyRound className="size-4" aria-hidden />
              Código de acesso
            </Button>
          </CodeAccessDialog>
          {/* Código: ícone compacto no celular, mantendo a ação sempre acessível. */}
          <CodeAccessDialog>
            <Button
              variant="outline"
              size="icon"
              aria-label="Entrar com código de teste"
              className={cn(
                "lg:hidden",
                !scrolled && "border-hero-border-strong bg-hero-surface-soft text-hero-fg hover:bg-hero-surface hover:text-hero-fg",
              )}
            >
              <KeyRound className="size-4" aria-hidden />
            </Button>
          </CodeAccessDialog>
          {/* Entrar: presente no desktop e no mobile. */}
          <Button
            variant="ghost"
            className={cn(
              "h-10 px-4 text-sm font-semibold border border-white/10 hover:bg-white/5",
              !scrolled && "text-hero-fg",
            )}
            asChild
          >
            <Link to="/auth" search={{ mode: "login" }}>Entrar</Link>
          </Button>
          {!hideActions && (
            <>
              <Button className="cta-lift group hidden h-10 items-center rounded-lg bg-emerald-500 px-6 text-sm font-bold text-black shadow-lg shadow-emerald-500/10 transition-all hover:bg-emerald-400 sm:flex" asChild>
                <Link to="/auth" search={{ mode: "signup" }}>Criar conta grátis</Link>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={cn("lg:hidden", !scrolled && "border-hero-border-strong bg-hero-surface-soft text-hero-fg hover:bg-hero-surface hover:text-hero-fg")}
                aria-expanded={open}
                aria-label={open ? "Fechar menu" : "Abrir menu"}
                onClick={() => setOpen((v) => !v)}
              >
                {open ? <X className="size-4" /> : <Menu className="size-4" />}
              </Button>
            </>
          )}
        </div>

      </div>

      {open && (
        <div className="border-t border-border bg-background/95 backdrop-blur-md lg:hidden">
          <nav aria-label="Navegação móvel" className="section-shell flex flex-col py-3">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                aria-current={active === item.href ? "location" : undefined}
                onClick={(event) => handleAnchorClick(event, item.href, () => setOpen(false))}
                className={cn(
                  "flex min-h-11 items-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  active === item.href
                    ? "bg-accent text-foreground font-bold"
                    : "text-[oklch(0.25_0.04_259)] dark:text-muted-foreground",
                )}
              >
                {item.label}
              </a>
            ))}
            <div className="mt-3 grid gap-2">
              <div className="flex items-center gap-2">
                <Button variant="outline" className="flex-1" asChild>
                  <Link to="/auth" search={{ mode: "login" }}>Entrar</Link>
                </Button>
                <Button className="flex-1" asChild>
                  <a
                    href="#planos"
                    onClick={(event) => handleAnchorClick(event, "#planos", () => setOpen(false))}
                  >
                    Começar
                  </a>
                </Button>
              </div>
              <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-accent/30 p-2">
                <span className="text-xs font-semibold text-[oklch(0.25_0.04_259)] dark:text-muted-foreground">Alternar tema</span>
                <ThemeToggle className="h-9 w-9" />
              </div>
              <CodeAccessDialog>
                <Button variant="ghost" className="w-full justify-center text-xs">
                  <KeyRound className="size-3.5" aria-hidden />
                  Código de acesso
                </Button>
              </CodeAccessDialog>
            </div>
          </nav>
        </div>
      )}
    </header>
    </>
  );
}
