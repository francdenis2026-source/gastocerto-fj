import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

interface RevealProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Direction of the entry motion */
  from?: "up" | "down" | "left" | "right" | "none";
}

const offsets = {
  up: { y: 16, x: 0 },
  down: { y: -16, x: 0 },
  left: { y: 0, x: 16 },
  right: { y: 0, x: -16 },
  none: { y: 0, x: 0 },
};

export function Reveal({ children, className, delay = 0, from = "up", ...props }: RevealProps) {
  const offset = offsets[from];

  return (
    <motion.div
      initial={{ opacity: 0, ...offset, filter: "blur(2px)" }}
      whileInView={{ opacity: 1, y: 0, x: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.22,
        delay: delay / 1000,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
