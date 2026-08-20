import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMouseGlow } from "@/hooks/use-mouse-glow";

const links = [
  { label: "Plataforma", href: "#plataforma" },
  { label: "Método", href: "#metodo" },
  { label: "Kids", href: "/auth?mode=kid" },
  { label: "Segurança", href: "#seguranca" },
  { label: "Planos", href: "#planos" },
];

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useMouseGlow();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-[1000] py-2 bg-[#00050a]/80 backdrop-blur-xl border-b border-white/5 transition-all duration-500"
      )}
    >
      <div 
        className="container mx-auto flex h-14 items-center justify-between px-6"
      >
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <Logo className="h-8 w-auto" />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <motion.a
                key={link.href}
                href={link.href}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary relative group glow-effect"
              >
                {link.label}
                <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-primary origin-left scale-x-0 transition-transform group-hover:scale-x-100" />
              </motion.a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            to="/auth" 
            search={{ mode: "login" }}
            className="hidden text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors md:block px-3"
          >
            Entrar
          </Link>
          <Button
            size="sm"
            className="h-9 rounded-xl bg-primary px-5 text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
            asChild
          >
            <Link to="/auth" search={{ mode: "signup" }}>
              Criar Conta
            </Link>
          </Button>
          
          <button
            onClick={() => setOpen(!open)}
            className="flex size-10 items-center justify-center rounded-xl bg-muted/50 text-foreground md:hidden"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute inset-x-0 top-full mt-4 rounded-3xl border border-border bg-background p-6 shadow-2xl md:hidden"
          >
            <nav className="flex flex-col gap-4">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between text-lg font-bold text-foreground p-2"
                >
                  {link.label}
                  <ArrowRight size={18} className="text-primary" />
                </a>
              ))}
              <hr className="border-border my-2" />
              <Link
                to="/auth"
                search={{ mode: "login" }}
                className="text-lg font-bold text-foreground p-2"
              >
                Entrar na conta
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}