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
          "fixed inset-x-0 top-0 z-[1000] h-16 bg-background text-foreground border-b",
          scrolled
            ? "border-emerald-500/40 shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
            : "border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]",
        )}
      >
        <div className="section-shell flex h-16 items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6">
          <Logo onDark={false} href="#inicio" className="group shrink-0" />



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
                    "nav-underline relative inline-flex min-h-10 items-center whitespace-nowrap rounded-xl px-4 text-[13px] font-black uppercase tracking-[0.2em] transition-colors hover:bg-emerald-500/5 focus-visible:outline-none",
                    isActive ? "text-emerald-500" : "text-foreground/80 hover:text-emerald-500",
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
          <ThemeToggle className="inline-flex rounded-xl border border-border/40 bg-accent/50 text-foreground transition-transform hover:scale-105 active:scale-95" />
          <CodeAccessDialog>
            <Button
              variant="ghost"
              className="hidden h-10 rounded-xl px-4 text-[13px] font-bold tracking-tight text-foreground/70 transition-colors hover:bg-accent hover:text-foreground active:scale-95 lg:inline-flex"
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
              className="lg:hidden rounded-xl border-border/40 bg-accent/50 text-foreground transition-transform active:scale-95"
            >
              <KeyRound className="size-4" aria-hidden />
            </Button>
          </CodeAccessDialog>
          {/* Entrar: presente no desktop e no mobile. */}
          <Button
            variant="ghost"
            className="hidden xs:inline-flex h-10 items-center rounded-xl border border-border/40 bg-accent/40 px-4 text-[11px] font-black uppercase tracking-[0.2em] text-foreground transition-colors duration-300 hover:border-[#1FAE6D] hover:bg-[#1FAE6D] hover:text-black active:scale-95 group"
            asChild
          >
            <Link to="/auth" search={{ mode: "login" }}>
              <span className="flex items-center gap-2">
                Entrar
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 transition-colors group-hover:bg-emerald-500/20">
                  <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                </div>
              </span>
            </Link>
          </Button>

          {!hideActions && (
            <>
              <Button className="cta-lift group hidden h-10 items-center rounded-xl bg-gradient-to-r from-[#1FAE6D] to-[#3fc78a] px-5 text-[11px] font-black uppercase tracking-[0.2em] text-black shadow-lg shadow-[#1FAE6D]/25 transition-all duration-300 md:flex" asChild>
                <Link to="/auth" search={{ mode: "signup" }}>Começar Agora</Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "lg:hidden z-[1001] rounded-xl border border-border/40 bg-accent/50 text-foreground transition-transform active:scale-95",
                  open && "border-emerald-500/30 bg-emerald-500/20 text-emerald-500",
                )}
                aria-expanded={open}
                aria-label={open ? "Fechar menu" : "Abrir menu"}
                onClick={() => setOpen((v) => !v)}
              >
                {open ? <X className="size-5" /> : <Menu className="size-5" />}
              </Button>
            </>
          )}
        </div>

        </div>

      </div>

      <div 
        className={cn(
          "fixed inset-x-0 top-0 z-[900] flex flex-col items-center justify-center bg-background transition-all duration-500 lg:hidden",
          open ? "h-screen opacity-100 visible" : "h-0 opacity-0 invisible overflow-hidden"
        )}
      >
        <nav aria-label="Navegação móvel" className="flex flex-col items-center gap-8 px-6 text-center">
          {navItems.map((item, index) => (
            <a
              key={item.href}
              href={item.href}
              aria-current={active === item.href ? "location" : undefined}
              onClick={(event) => handleAnchorClick(event, item.href, () => setOpen(false))}
              className={cn(
                "text-2xl font-bold tracking-tighter transition-all duration-300 hover:text-emerald-400",
                active === item.href
                  ? "text-emerald-500 scale-110"
                  : "text-white/70",
                open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              )}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              {item.label}
            </a>
          ))}
          
          <div className={cn(
            "mt-8 flex flex-col gap-4 w-full max-w-xs transition-all duration-500 delay-200",
            open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )}>
            <Button size="lg" className="w-full h-14 text-base font-bold rounded-2xl bg-[#1FAE6D] text-black" asChild>
              <Link to="/auth" search={{ mode: "signup" }} onClick={() => setOpen(false)}>Começar Agora</Link>
            </Button>
            <Button variant="outline" size="lg" className="w-full h-14 text-base font-bold rounded-2xl border-white/10 text-white" asChild>
              <Link to="/auth" search={{ mode: "login" }} onClick={() => setOpen(false)}>Entrar</Link>
            </Button>
            <CodeAccessDialog>
              <Button variant="ghost" className="w-full text-white/50 py-4" onClick={() => setOpen(false)}>
                <KeyRound className="size-4 mr-2" aria-hidden />
                Acesso Restrito
              </Button>
            </CodeAccessDialog>
          </div>
        </nav>
      </div>
    </header>
    
    </>
  );
}
