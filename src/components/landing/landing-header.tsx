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
        "fixed top-0 inset-x-0 z-[1000] border-b transition-all duration-300",
        scrolled ? "h-16 bg-background/80 backdrop-blur-md border-border" : "h-20 bg-background border-transparent"
      )}
    >
      <div className="section-shell h-full flex items-center justify-between">
        <Logo className="scale-110" />

        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-secondary-foreground">
          {["Recursos", "Planos", "Benefícios", "FAQ"].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="nav-underline py-2">
              {item}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button variant="ghost" className="hidden sm:flex rounded-full" asChild>
            <Link to="/auth" search={{ mode: "login" }}>Entrar</Link>
          </Button>
          <Button className="rounded-full px-6 bg-primary text-primary-foreground hover:opacity-90" asChild>
            <Link to="/auth" search={{ mode: "signup" }}>Começar Agora</Link>
          </Button>
          <button className="lg:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}
