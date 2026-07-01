"use client";

import { motion, type Variants } from "framer-motion";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

/** Einzelnes Element, das beim Scrollen ins Viewport sanft nach oben einblendet. */
export function Reveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Container, der seine <StaggerItem>-Kinder gestaffelt einblendet.
 * trigger="load" → sofort beim Mount (Hero), "view" → beim Scrollen.
 */
export function Stagger({
  children,
  className,
  trigger = "view",
}: {
  children: React.ReactNode;
  className?: string;
  trigger?: "load" | "view";
}) {
  const trig =
    trigger === "load"
      ? { animate: "show" as const }
      : { whileInView: "show" as const, viewport: { once: true, amount: 0.15 } };
  return (
    <motion.div className={className} variants={container} initial="hidden" {...trig}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={fadeUp}>
      {children}
    </motion.div>
  );
}
