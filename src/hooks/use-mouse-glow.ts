import { useEffect } from "react";

/**
 * Hook to apply a professional mouse-following glow effect to interactive elements.
 * It tracks mouse position and updates CSS variables --mouse-x and --mouse-y.
 */
export function useMouseGlow() {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const targets = document.querySelectorAll('.glow-effect, button, a:not(.no-glow)');
      
      targets.forEach((target) => {
        const rect = (target as HTMLElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        (target as HTMLElement).style.setProperty("--mouse-x", `${x}px`);
        (target as HTMLElement).style.setProperty("--mouse-y", `${y}px`);
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);
}
