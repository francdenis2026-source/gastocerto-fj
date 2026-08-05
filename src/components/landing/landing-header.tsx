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
           "fixed inset-x-0 top-0 z-[1000] h-16 bg-background border-b lg:h-20 transition-all duration-300",
           scrolled
             ? "shadow-sm border-border"
             : "border-transparent",
         )}
       >
         <div className="section-shell flex h-16 items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6 lg:h-20">
           <Logo onDark={false} href="#inicio" className="group shrink-0 scale-110" />

           <nav
             aria-label="Navegação principal"
             className="ml-auto mr-auto hidden min-w-0 items-center justify-center gap-1 rounded-full border border-border bg-card/50 p-0.5 lg:flex"
           >
             {navItems.map((item) => {
               const isActive = active === item.href;
               return (
                 <a
                   key={item.href}
                   href={item.href}
                   aria-current={isActive ? "location" : undefined}
                   onClick={(event) => handleAnchorClick(event, item.href)}
                   className={cn(
                     "group relative inline-flex min-h-9 items-center justify-center overflow-hidden whitespace-nowrap rounded-full px-4 text-sm font-medium transition-all duration-300",
                     isActive
                       ? "bg-primary text-primary-foreground shadow-sm"
                       : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                   )}
                 >
                   {item.label}
                 </a>
               );
             })}
           </nav>

         <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
           <ThemeToggle className="rounded-full border border-border bg-card hover:bg-secondary text-foreground transition-all duration-300 active:scale-95" />
           
           <Button
             variant="ghost"
             className="hidden h-10 items-center rounded-full px-5 text-sm font-medium text-foreground transition-all duration-300 hover:bg-secondary active:scale-95 lg:inline-flex"
             asChild
           >
             <Link to="/auth" search={{ mode: "login" }}>
               Entrar
             </Link>
           </Button>
 
           {!hideActions && (
             <>
               <Button className="relative hidden h-10 items-center overflow-hidden rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-300 hover:opacity-90 active:scale-95 md:flex" asChild>
                 <Link to="/auth" search={{ mode: "signup" }}>
                   Começar Agora
                 </Link>
               </Button>
               <Button
                 variant="ghost"
                 size="icon"
                 className={cn(
                   "lg:hidden z-[1001] rounded-full border border-border bg-card text-foreground transition-transform active:scale-95",
                   open && "text-primary",
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
      </header>




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
                 "text-2xl font-bold tracking-tighter transition-all duration-300 hover:text-primary",
                 active === item.href
                   ? "text-primary scale-110"
                  : "text-foreground/70",
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
            <Button size="lg" className="w-full h-14 text-base font-bold rounded-2xl bg-primary text-primary-foreground" asChild>
              <Link to="/auth" search={{ mode: "signup" }} onClick={() => setOpen(false)}>Começar Agora</Link>
            </Button>
            <Button variant="outline" size="lg" className="w-full h-14 text-base font-bold rounded-2xl border-border/40 text-foreground" asChild>
              <Link to="/auth" search={{ mode: "login" }} onClick={() => setOpen(false)}>Entrar</Link>
            </Button>
            <CodeAccessDialog>
              <Button variant="ghost" className="w-full text-foreground/60 py-4" onClick={() => setOpen(false)}>
                <KeyRound className="size-4 mr-2" aria-hidden />
                Acesso Restrito
              </Button>
            </CodeAccessDialog>
          </div>
        </nav>
      </div>
    </>

  );
}
