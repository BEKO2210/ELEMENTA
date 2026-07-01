import type { Metadata } from "next";

// /login gehört nicht in den Google-Index (persönlich/funktional).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
