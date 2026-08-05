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
  { label: "Recursos", href: "#recursos" },
  { label: "Planos", href: "#planos" },
  { label: "Suporte", href: "#faq" },
  { label: "Contato", href: "#contato" },
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
      

      <header
        className={cn(
          "fixed inset-x-0 z-[1000] transition-all duration-500 top-0",
          scrolled
            ? "glass-morphism border border-emerald-500/30 text-foreground shadow-[0_20px_50px_rgba(0,0,0,0.5)] mx-2 mt-2 sm:mx-auto sm:mt-4 max-w-7xl rounded-[1.5rem] sm:rounded-[2rem]"
            : "border-b border-white/10 bg-[#0A1512] text-foreground shadow-lg isolate",
        )}
      >


        <div className={cn("section-shell flex items-center justify-between gap-2 transition-all duration-500 sm:gap-4", scrolled ? "h-14 sm:h-16 px-4 sm:px-6" : "h-16 sm:h-20 px-4 sm:px-6")}>
          <Logo onDark={!scrolled} href="#inicio" className="group shrink-0 scale-90 sm:scale-100" />


          <nav aria-label="Navegação principal" className="ml-auto mr-auto hidden min-w-0 items-center gap-0.5 pl-6 lg:flex xl:gap-1">
            {navItems.map((item) => {
              const isActive = active === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "location" : undefined}
                  onClick={(event) => handleAnchorClick(event, item.href)}
                  className={cn(
                    "nav-underline relative inline-flex min-h-10 items-center whitespace-nowrap rounded-xl px-4 text-[13px] font-bold uppercase tracking-[0.15em] transition-all hover:bg-emerald-500/5 focus-visible:outline-none",
                    isActive 
                      ? "text-emerald-400" 
                      : scrolled 
                        ? "text-foreground/80 hover:text-emerald-400" 
                        : "text-white/80 hover:text-white",
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
              "hidden xs:inline-flex h-10 sm:h-12 px-4 sm:px-8 text-[11px] sm:text-[12px] font-black uppercase tracking-[0.2em] rounded-xl sm:rounded-2xl border border-white/10 bg-white/[0.05] hover:bg-[#1FAE6D] hover:text-black hover:border-[#1FAE6D] shadow-[0_0_20px_rgba(31,174,109,0)] hover:shadow-[0_0_20px_rgba(31,174,109,0.4)] transition-all duration-300 active:scale-95 group",
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
              <Button className="cta-lift group hidden h-10 sm:h-12 items-center rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#1FAE6D] to-[#3fc78a] px-4 sm:px-8 text-[11px] sm:text-[12px] font-black uppercase tracking-[0.2em] text-black shadow-xl shadow-[#1FAE6D]/30 transition-all duration-300 md:flex" asChild>
                <Link to="/auth" search={{ mode: "signup" }}>Começar Agora</Link>
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
        <div className="fixed inset-x-0 top-[4.5rem] z-[100] mx-2 mt-2 rounded-[1.5rem] border border-emerald-500/30 bg-background/95 p-2 shadow-2xl backdrop-blur-md lg:hidden sm:mx-4 sm:top-[5.5rem]">
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
