import { motion } from "motion/react";
import { type ReactNode } from "react";

type AnimatedSectionProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "scale" | "none";
  duration?: number;
  once?: boolean;
};

const variants = {
  up: { y: 40, opacity: 0 },
  down: { y: -40, opacity: 0 },
  left: { x: -40, opacity: 0 },
  right: { x: 40, opacity: 0 },
  scale: { scale: 0.92, opacity: 0 },
  none: {},
};

export function AnimatedSection({
  children,
  className,
  delay = 0,
  direction = "up",
  duration = 0.5,
  once = true,
}: AnimatedSectionProps) {
  return (
    <motion.div
      className={className}
      initial={direction === "none" ? {} : variants[direction]}
      whileInView={{
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
        transition: {
          duration,
          delay,
          ease: [0.25, 0.1, 0.25, 1] as const,
        },
      }}
      viewport={{ once, margin: "-60px" }}
    >
      {children}
    </motion.div>
  );
}
