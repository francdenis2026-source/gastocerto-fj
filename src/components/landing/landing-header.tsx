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
        "fixed top-0 inset-x-0 z-[1000] transition-all duration-300 border-b",
        scrolled 
          ? "h-16 bg-background/80 backdrop-blur-md border-border" 
          : "h-20 bg-background border-transparent"
      )}
    >
      <div className="section-shell h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Logo className="h-8 w-auto" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-semibold text-foreground/80">
          {["Recursos", "Planos", "Benefícios", "FAQ"].map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase()}`} 
              className="px-4 py-2 rounded-full hover:bg-secondary hover:text-foreground transition-all duration-200"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="hidden sm:flex items-center gap-3">
            <Button variant="ghost" className="rounded-full font-bold" asChild>
              <Link to="/auth" search={{ mode: "login" }}>Entrar</Link>
            </Button>
            <Button className="rounded-full px-6 font-bold bg-primary text-primary-foreground shadow-lg hover:shadow-primary/25" asChild>
              <Link to="/auth" search={{ mode: "signup" }}>Começar Agora</Link>
            </Button>
          </div>
          
          {/* Mobile Toggle */}
          <button className="lg:hidden p-2 rounded-full hover:bg-secondary" onClick={() => setOpen(!open)}>
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {open && (
        <div className="lg:hidden absolute inset-x-0 top-full bg-background border-b border-border shadow-2xl p-6 flex flex-col gap-4 animate-in slide-in-from-top-4">
          {["Recursos", "Planos", "Benefícios", "FAQ"].map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase()}`} 
              className="text-lg font-bold py-3 border-b border-border"
              onClick={() => setOpen(false)}
            >
              {item}
            </a>
          ))}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <Button variant="outline" className="h-12 rounded-full" asChild>
              <Link to="/auth" search={{ mode: "login" }}>Entrar</Link>
            </Button>
            <Button className="h-12 rounded-full" asChild>
              <Link to="/auth" search={{ mode: "signup" }}>Criar Conta</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
