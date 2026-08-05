import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, KeyRound, Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CodeAccessDialog } from "@/components/landing/code-access-dialog";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { handleAnchorClick } from "@/lib/scroll";

const navItems = [
  { label: "Soluções", href: "#recursos" },
  { label: "Inteligência", href: "#ai" },
  { label: "Planos", href: "#planos" },
  { label: "Segurança", href: "#seguranca" },
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


  return (
    <>
      <div className="fixed top-0 inset-x-0 z-[60] h-1.5 bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
      
      <header
        className={cn(
          "fixed inset-x-0 z-50 transition-all duration-500 top-1.5",
          scrolled
            ? "glass-morphism border-b border-emerald-500/20 text-foreground shadow-2xl py-2"
            : "border-b border-white/5 bg-transparent text-foreground dark:text-hero-fg py-5",
        )}
      >


        <div className="section-shell flex h-24 items-center justify-between gap-2 sm:gap-4 transition-all duration-500">
          <Logo onDark={!scrolled} href="#inicio" className="group shrink-0 py-1" />

          <nav aria-label="Navegação principal" className="hidden min-w-0 items-center gap-0.5 lg:flex xl:gap-1">
            {navItems.map((item) => {
              const isActive = active === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "location" : undefined}
                  onClick={(event) => handleAnchorClick(event, item.href)}
                  className={cn(
                    "relative inline-flex min-h-11 items-center whitespace-nowrap rounded-xl px-3 text-[11px] font-black uppercase tracking-[0.14em] xl:px-4 xl:text-[12px] xl:tracking-[0.18em] transition-all duration-300 focus-visible:outline-none",
                    isActive 
                      ? "text-emerald-400" 
                      : scrolled 
                        ? "text-foreground/60 hover:text-emerald-500 hover:bg-emerald-500/5" 
                        : "text-white/60 hover:text-emerald-400 hover:bg-white/5",
                  )}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                  )}
                </a>
              );
            })}
          </nav>


        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <ThemeToggle className={cn("inline-flex rounded-xl transition-all hover:scale-105 active:scale-95", !scrolled ? "text-white bg-white/5 border border-white/10 hover:bg-white/10" : "text-foreground bg-accent/50 border border-border/10")} />
          <CodeAccessDialog>
            <Button
              variant="ghost"
              className={cn("hidden lg:inline-flex h-10 px-4 text-[13px] font-bold tracking-tight rounded-xl transition-all active:scale-95", !scrolled ? "text-white hover:bg-white/5" : "text-foreground/70 hover:text-foreground hover:bg-accent")}
            >
              <KeyRound className="size-4 mr-2" aria-hidden />
              Acesso Restrito
            </Button>
          </CodeAccessDialog>

          {/* Código: ícone compacto no celular, mantendo a ação sempre acessível. */}
          <CodeAccessDialog>
            <Button
              variant="outline"
              size="icon"
              aria-label="Entrar com código de teste"
              className={cn(
                "lg:hidden rounded-xl border-white/10 bg-white/5 text-white transition-all active:scale-95",
                !scrolled && "border-white/20 bg-white/10",
              )}
            >
              <KeyRound className="size-4" aria-hidden />
            </Button>
          </CodeAccessDialog>
          {/* Entrar: presente no desktop e no mobile. */}
          <Button
            variant="ghost"
            className={cn(
              "h-11 px-6 text-[13px] font-black uppercase tracking-[0.15em] rounded-2xl border border-white/10 hover:bg-emerald-500/10 hover:border-emerald-500/20 transition-all active:scale-95 group",
              !scrolled ? "text-white" : "text-foreground",
            )}
            asChild
          >
            <Link to="/auth" search={{ mode: "login" }}>
              <span className="flex items-center gap-2">
                Entrar
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                  <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                </div>
              </span>
            </Link>
          </Button>

          {!hideActions && (
            <>
              <Button className="cta-lift group hidden h-11 items-center rounded-2xl bg-emerald-500 px-8 text-[13px] font-black uppercase tracking-[0.15em] text-[#001640] shadow-xl shadow-emerald-500/30 transition-all hover:bg-emerald-400 hover:scale-105 active:scale-95 sm:flex" asChild>
                <Link to="/auth" search={{ mode: "signup" }}>Experimentar Grátis</Link>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={cn("lg:hidden rounded-xl border-white/10 bg-white/5 text-white active:scale-95", !scrolled && "border-white/20 bg-white/10")}

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
