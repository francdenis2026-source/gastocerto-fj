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
        "fixed top-0 inset-x-0 z-[1000] transition-all duration-300",
        scrolled 
          ? "h-16 bg-background/90 backdrop-blur-xl border-b border-border shadow-sm" 
          : "h-20 bg-background border-b border-transparent"
      )}
    >
      <div className="section-shell h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Logo className="h-10 w-auto" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-2 text-[15px] font-medium text-foreground/80">
          {["Recursos", "Planos", "Benefícios", "FAQ"].map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase()}`} 
              className="px-5 py-2.5 rounded-full hover:bg-secondary hover:text-foreground transition-all duration-300"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="hidden sm:flex items-center gap-3">
            <Button variant="ghost" className="rounded-full font-semibold h-10 px-6" asChild>
              <Link to="/auth" search={{ mode: "login" }}>Entrar</Link>
            </Button>
            <Button className="rounded-full px-8 font-semibold h-10 bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all" asChild>
              <Link to="/auth" search={{ mode: "signup" }}>Começar Agora</Link>
            </Button>
          </div>
          
          {/* Mobile Toggle */}
          <button className="lg:hidden p-2 rounded-full hover:bg-secondary transition-colors" onClick={() => setOpen(!open)}>
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
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
