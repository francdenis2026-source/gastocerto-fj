import { useCallback, useEffect, useState } from "react";

/**
 * Tema INDEPENDENTE do Espaço Kids.
 *
 * Por quê: a criança usa o mesmo navegador do responsável em muitos casos, mas a
 * preferência visual dela não deve sobrescrever (nem ser sobrescrita por) a do
 * adulto. Guardamos a escolha em uma chave própria por dependente e aplicamos a
 * classe `dark` apenas enquanto o Espaço Kids está montado — ao sair, o tema do
 * responsável é restaurado exatamente como estava.
 */

export type KidTheme = "light" | "dark";

const PARENT_KEY = "gastocerto-theme";
const kidKey = (dependentId: string) => `gastocerto-kid-theme-${dependentId}`;

function readParentTheme(): KidTheme {
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage.getItem(PARENT_KEY);
  return stored === "light" ? "light" : "dark";
}

function applyTheme(theme: KidTheme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  meta?.setAttribute("content", theme === "dark" ? "#0d1b3e" : "#f6f8fb");
}

export function useKidTheme(dependentId: string | undefined) {
  const [theme, setThemeState] = useState<KidTheme>("dark");

  // Carrega a preferência da criança (ou herda a atual como ponto de partida).
  useEffect(() => {
    if (!dependentId || typeof window === "undefined") return;
    const stored = window.localStorage.getItem(kidKey(dependentId));
    const initial: KidTheme = stored === "light" || stored === "dark" ? stored : readParentTheme();
    setThemeState(initial);
    applyTheme(initial);

    return () => {
      // Restaura o tema do responsável ao sair do Espaço Kids.
      applyTheme(readParentTheme());
    };
  }, [dependentId]);

  const setTheme = useCallback(
    (next: KidTheme) => {
      setThemeState(next);
      applyTheme(next);
      if (dependentId && typeof window !== "undefined") {
        window.localStorage.setItem(kidKey(dependentId), next);
      }
    },
    [dependentId],
  );

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [setTheme, theme]);

  return { theme, setTheme, toggleTheme };
}
