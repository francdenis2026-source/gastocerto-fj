import { useHydrated } from "@/hooks/use-hydrated";
import heroMobileAlt from "@/assets/hero-mobile-pro-2027.jpg";

export function MobileHeroSection() {
  const hydrated = useHydrated();

  if (!hydrated) return null;

  return (
    <section className="relative overflow-hidden px-4 py-8 md:hidden">
      <div className="relative flex flex-col gap-6 overflow-hidden rounded-[2.5rem] border border-border/50 bg-card shadow-lifted animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src={heroMobileAlt}
            alt="Fundo profissional financeiro"
            className="h-full w-full object-cover opacity-30"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-card/40 via-card/80 to-card" />
        </div>

        <div className="relative z-10 p-8 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-trending-up"
            >
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          </div>
          
          <h2 className="font-display text-2xl font-black tracking-tight text-foreground">
            A evolução do seu <span className="text-brand">controle financeiro</span>
          </h2>
          
          <p className="mt-4 text-sm font-medium leading-relaxed text-muted-foreground">
            Mais que planilhas, uma inteligência dedicada à sua prosperidade e tranquilidade diária.
          </p>
          
          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border/40 bg-card/50 p-3 backdrop-blur-sm">
              <p className="text-xl font-black text-brand">100%</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Seguro</p>
            </div>
            <div className="rounded-2xl border border-border/40 bg-card/50 p-3 backdrop-blur-sm">
              <p className="text-xl font-black text-brand">+24k</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Usuários</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
