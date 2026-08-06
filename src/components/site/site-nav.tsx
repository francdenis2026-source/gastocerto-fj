import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { label: "Plataforma", href: "#plataforma" },
  { label: "Método", href: "#metodo" },
  { label: "Segurança", href: "#seguranca" },
  { label: "Planos", href: "#planos" },
];

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-[900] transition-[background-color,border-color] duration-300",
        scrolled
          ? "border-b border-border bg-navy-800/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="shell flex h-16 items-center justify-between lg:h-[76px]">
        <div className="group flex items-center">
          <Logo onDark className="scale-[0.85] origin-left lg:scale-90" />
        </div>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-[14px] font-medium text-bone-100/60 transition-colors duration-200 hover:text-bone-100 focus-visible:text-bone-100"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button
            variant="ghost"
            className="h-10 rounded-full px-5 text-[14px] font-semibold text-bone-100/80 hover:bg-navy-600 hover:text-bone-100"
            asChild
          >
            <Link to="/auth" search={{ mode: "login" }}>
              Entrar
            </Link>
          </Button>
          <Button
            className="h-10 rounded-full bg-primary px-6 text-[14px] font-semibold text-primary-foreground hover:bg-brand-400"
            asChild
          >
            <Link to="/auth" search={{ mode: "signup" }}>
              Criar conta
            </Link>
          </Button>
        </div>

        <button
          type="button"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen((v) => !v)}
          className="flex size-11 items-center justify-center rounded-full border border-border text-bone-100 lg:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 top-16 z-[899] bg-navy-800/98 backdrop-blur-xl lg:hidden"
          >
            <div className="shell flex flex-col gap-1 pt-8">
              {links.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * i, duration: 0.2 }}
                  className="border-b border-border py-5 font-display text-2xl font-semibold text-bone-100"
                >
                  {link.label}
                </motion.a>
              ))}
              <div className="mt-8 flex flex-col gap-3">
                <Button className="h-13 rounded-full bg-primary text-base font-semibold" asChild>
                  <Link to="/auth" search={{ mode: "signup" }} onClick={() => setOpen(false)}>
                    Criar conta
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-13 rounded-full border-border text-base font-semibold text-bone-100"
                  asChild
                >
                  <Link to="/auth" search={{ mode: "login" }} onClick={() => setOpen(false)}>
                    Entrar
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
