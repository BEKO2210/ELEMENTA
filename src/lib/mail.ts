import "server-only";
import nodemailer from "nodemailer";

/**
 * Zentraler Mailversand über SMTP (nodemailer). Konfiguration per Env:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, SMTP_SECURE(optional)
 * Ist nichts konfiguriert, gilt Mail als NICHT verfügbar (kein stiller Fake-Erfolg
 * — Wahrheitsregel). Für IONOS z. B. Host `smtp.ionos.de`, Port 587.
 */
export function mailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_FROM);
}

let cached: nodemailer.Transporter | null = null;
function transport() {
  if (cached) return cached;
  const port = Number(process.env.SMTP_PORT || 587);
  cached = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    // 465 = implizites TLS; 587/25 = STARTTLS. Über SMTP_SECURE übersteuerbar.
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return cached;
}

export async function sendMail(opts: { to: string; subject: string; html: string; text: string }) {
  if (!mailConfigured()) throw new Error("SMTP nicht konfiguriert");
  await transport().sendMail({
    from: process.env.SMTP_FROM,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
  });
}

// Absolute Basis-URL für Links in Mails (Confirm-Link etc.).
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://ui.it-handwerk-stuttgart.de").replace(/\/$/, "");
}
