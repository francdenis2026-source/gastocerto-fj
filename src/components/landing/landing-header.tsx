import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-[1000] transition-all duration-500",
        scrolled 
          ? "h-16 bg-background/80 backdrop-blur-2xl border-b border-white/5 shadow-2xl" 
          : "h-20 bg-transparent border-b border-transparent"
      )}
    >
      <div className="section-shell h-full flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <Logo className="h-10 sm:h-12 w-auto transition-transform duration-200 hover:scale-[1.03]" />
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-2 text-[14px] font-bold text-foreground/70">
          {["Recursos", "Planos", "Benefícios", "FAQ"].map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase()}`} 
              className="px-6 py-2.5 rounded-full hover:bg-white/5 hover:text-foreground transition-all duration-300 relative group"
            >
              {item}
              <span className="absolute bottom-2 left-6 right-6 h-px bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="hidden sm:flex items-center gap-3">
            <Button variant="ghost" className="rounded-full font-bold h-11 px-8 text-foreground/80 hover:text-foreground transition-colors" asChild>
              <Link to="/auth" search={{ mode: "login" }}>Entrar</Link>
            </Button>
            <Button className="rounded-full px-8 font-bold h-11 bg-primary text-white shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all hover:scale-105 active:scale-95" asChild>
              <Link to="/auth" search={{ mode: "signup" }}>Começar Agora</Link>
            </Button>
          </div>
          
          {/* Mobile Toggle */}
          <button
            type="button"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            className="lg:hidden grid size-11 place-items-center rounded-full hover:bg-white/5 active:scale-95 transition-all duration-200"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="size-6" aria-hidden="true" /> : <Menu className="size-6" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {open && (
        <div className="lg:hidden absolute inset-x-0 top-full bg-background border-b border-border shadow-2xl p-6 flex flex-col gap-2 animate-in fade-in slide-in-from-top-4">
          {["Recursos", "Planos", "Benefícios", "FAQ"].map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase()}`} 
              className="text-lg font-bold py-4 border-b border-border flex items-center justify-between"
              onClick={() => setOpen(false)}
            >
              {item}
            </a>
          ))}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <Button variant="outline" className="h-14 rounded-full text-base" asChild>
              <Link to="/auth" search={{ mode: "login" }}>Entrar</Link>
            </Button>
            <Button className="h-14 rounded-full text-base bg-primary text-white" asChild>
              <Link to="/auth" search={{ mode: "signup" }}>Criar Conta</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
