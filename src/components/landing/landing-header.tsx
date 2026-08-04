
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, ArrowRight, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Recursos", href: "#recursos" },
  { label: "IA Financeira", href: "#ia" },
  { label: "Planos", href: "#planos" },
  { label: "Segurança", href: "#seguranca" },
];

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-[100] transition-all duration-300",
        scrolled 
          ? "bg-background/80 backdrop-blur-md border-b border-border py-3" 
          : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto px-6 lg:px-12 flex items-center justify-between">
        <Logo className="scale-90 lg:scale-100" />

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/auth"
            search={{ mode: "login" }}
            className="hidden sm:inline-flex text-[13px] font-medium text-foreground px-4 py-2 rounded-full hover:bg-secondary transition-colors"
          >
            Entrar
          </Link>
          <Link
            to="/auth"
            search={{ mode: "signup" }}
            className="group relative inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground text-[13px] font-semibold px-5 py-2.5 rounded-full overflow-hidden transition-all hover:ring-4 hover:ring-primary/20 active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-2">
              Começar Grátis
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
          
          <button 
            className="md:hidden p-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[70px] z-[90] bg-background md:hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <nav className="flex flex-col p-6 gap-6">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-lg font-medium border-b border-border pb-4"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <div className="flex flex-col gap-4 mt-4">
              <Link
                to="/auth"
                search={{ mode: "login" }}
                className="w-full text-center py-4 rounded-2xl bg-secondary font-semibold"
                onClick={() => setMobileMenuOpen(false)}
              >
                Entrar
              </Link>
              <div className="flex items-center justify-center gap-2 text-muted-foreground py-4">
                <ShieldCheck className="size-4 text-primary" />
                <span className="text-xs font-medium uppercase tracking-widest">Seguro e Criptografado</span>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
