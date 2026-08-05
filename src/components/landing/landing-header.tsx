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
          "fixed inset-x-0 z-[1000] transition-all duration-700 top-0 motion-reduce:transition-none",
          scrolled
            ? "bg-background/90 border-b-[2px] border-emerald-500/40 text-foreground shadow-[0_40px_80px_rgba(0,0,0,0.8)] mx-2 mt-2 sm:mx-auto sm:mt-4 max-w-7xl rounded-[1.5rem] sm:rounded-[2rem] translate-y-2 scale-[0.985] motion-reduce:translate-y-0 motion-reduce:scale-100 backdrop-blur-md"
            : "bg-background text-foreground shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_10px_30px_rgba(0,0,0,0.5)] isolate border-b border-white/5",
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
                variant="ghost"
                size="icon"
                className={cn(
                  "lg:hidden z-[1001] rounded-xl border-white/10 bg-white/5 text-white active:scale-95 transition-all",
                  !scrolled && "border-white/20 bg-white/10",
                  open && "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
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
