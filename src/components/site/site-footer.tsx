import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/logo";

const columns = [
  {
    title: "Produto",
    links: [
      { label: "Plataforma", href: "#plataforma" },
      { label: "Método", href: "#metodo" },
      { label: "Planos", href: "#planos" },
      { label: "Segurança", href: "#seguranca" },
    ],
  },
  {
    title: "Recursos",
    links: [
      { label: "Contas e cartões", href: "#plataforma" },
      { label: "Combustível e gás", href: "#plataforma" },
      { label: "Espaço Kids", href: "#plataforma" },
      { label: "Balanço anual", href: "#plataforma" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-navy-900">
      <div className="shell py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_repeat(2,minmax(0,0.8fr))_minmax(0,1fr)]">
          <div>
            <Logo onDark className="scale-[0.85] origin-left" />
            <p className="mt-5 max-w-xs text-[14px] leading-relaxed text-bone-100/40">
              Controle de gastos pessoais feito no Brasil, para a rotina real das famílias
              brasileiras.
            </p>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-bone-100/35">
                {column.title}
              </p>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-[14px] text-bone-100/55 transition-colors duration-200 hover:text-bone-100 focus-visible:text-bone-100"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-bone-100/35">
              Conta
            </p>
            <ul className="mt-5 space-y-3">
              <li>
                <Link
                  to="/auth"
                  search={{ mode: "signup" }}
                  className="text-[14px] text-bone-100/55 transition-colors duration-200 hover:text-bone-100 focus-visible:text-bone-100"
                >
                  Criar conta
                </Link>
              </li>
              <li>
                <Link
                  to="/auth"
                  search={{ mode: "login" }}
                  className="text-[14px] text-bone-100/55 transition-colors duration-200 hover:text-bone-100 focus-visible:text-bone-100"
                >
                  Entrar
                </Link>
              </li>
            </ul>
            <div className="mt-8 flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-bone-100/40">
                Sistemas operando
              </span>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-border pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-bone-100/35">
            © {new Date().getFullYear()} GastoCerto. Todos os direitos reservados.
          </p>
          <p className="text-[13px] text-bone-100/35">Feijó · Acre · Brasil</p>
        </div>
      </div>
    </footer>
  );
}
