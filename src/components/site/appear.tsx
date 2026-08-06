import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

type AppearProps = HTMLMotionProps<"div"> & {
  children: ReactNode;
  delay?: number;
};

/** Entrada única de todo o site: 260ms, sem exageros. */
export function Appear({ children, delay = 0, ...props }: AppearProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-90px" }}
      transition={{ duration: 0.22, delay: delay / 1000, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
