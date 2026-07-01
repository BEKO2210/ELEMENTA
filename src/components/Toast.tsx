"use client";

import { createContext, useContext, useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X, Info, AlertTriangle } from "lucide-react";

type ToastVariant = "success" | "error" | "info";

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastApi {
  toast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastApi | undefined>(undefined);

let counter = 0;

const ICON = {
  success: Check,
  error: AlertTriangle,
  info: Info,
} as const;

const ACCENT = {
  success: "text-emerald-400",
  error: "text-red-400",
  info: "text-accent",
} as const;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setItems((list) => list.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const id = ++counter;
      setItems((list) => [...list, { id, message, variant }]);
      setTimeout(() => remove(id), 3000);
    },
    [remove],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-[min(92vw,340px)] flex-col gap-2">
        <AnimatePresence initial={false}>
          {items.map((t) => {
            const Icon = ICON[t.variant];
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.96 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="glass pointer-events-auto flex items-center gap-3 rounded-xl px-4 py-3 text-sm shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
              >
                <Icon size={17} className={ACCENT[t.variant]} />
                <span className="flex-1 text-fg">{t.message}</span>
                <button
                  onClick={() => remove(t.id)}
                  aria-label="Schließen"
                  className="text-fg-dim transition hover:text-fg"
                >
                  <X size={15} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  // Fallback: nie crashen, falls außerhalb des Providers verwendet.
  if (!ctx) return { toast: () => {} };
  return ctx;
}
