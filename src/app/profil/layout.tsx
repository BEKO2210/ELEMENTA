import type { Metadata } from "next";

// /profil ist privat/funktional — nicht indexieren.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ProfilLayout({ children }: { children: React.ReactNode }) {
  return children;
}
