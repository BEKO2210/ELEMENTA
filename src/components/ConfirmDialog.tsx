"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Bestätigen",
  cancelLabel = "Abbrechen",
  danger = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[110] grid place-items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="glass relative w-full max-w-sm rounded-2xl p-6 text-center"
          >
            <span
              className={`mx-auto grid h-12 w-12 place-items-center rounded-2xl ${
                danger ? "bg-red-400/10 text-red-400" : "bg-white/5 text-accent"
              }`}
            >
              <AlertTriangle size={22} />
            </span>
            <h2 className="mt-4 text-lg font-bold">{title}</h2>
            <p className="mt-2 text-sm text-fg-muted">{message}</p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-fg-muted transition hover:text-white"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition ${
                  danger ? "bg-red-500 hover:bg-red-600" : "btn-grad"
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
