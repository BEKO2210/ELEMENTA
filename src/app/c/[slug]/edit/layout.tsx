import type { Metadata } from "next";

// Bearbeiten-Seite ist nur für den Autor relevant — nicht indexieren.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function EditLayout({ children }: { children: React.ReactNode }) {
  return children;
}
