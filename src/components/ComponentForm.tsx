"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ID, Permission, Role } from "appwrite";
import { Loader2, Upload, Save } from "lucide-react";
import { databases, DB_ID, COL_COMPONENTS } from "@/lib/appwrite";
import { CATEGORIES, FRAMEWORKS } from "@/lib/mock-data";
import type { Framework, Category, UIComponent } from "@/lib/types";
import type { AuthUser } from "./AuthProvider";
import SandboxPreview from "./SandboxPreview";
import { useToast } from "./Toast";

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "komponente"
  );
}

export default function ComponentForm({
  user,
  mode = "create",
  initial,
}: {
  user: AuthUser;
  mode?: "create" | "edit";
  initial?: UIComponent;
}) {
  const router = useRouter();
  const { toast } = useToast();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [framework, setFramework] = useState<Framework>(initial?.framework ?? "html");
  const [category, setCategory] = useState<Category>(initial?.category ?? "buttons");
  const [tags, setTags] = useState(initial?.tags.join(", ") ?? "");
  const [html, setHtml] = useState(initial?.html ?? "");
  const [css, setCss] = useState(initial?.css ?? "");
  const [js, setJs] = useState(initial?.js ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Open-Source-Zustimmung (MIT) — Pflicht bei Neu-Veröffentlichung
  const [licenseOk, setLicenseOk] = useState(mode === "edit");

  // Das Formular passt sich dem gewählten Framework an: Ein-Datei-Frameworks
  // (Vue-SFC, Svelte) brauchen nur EIN Code-Feld, React braucht kein JS-Feld usw.
  const CODE_SPEC: Record<string, {
    label: string;
    placeholder: string;
    rows: number;
    hint?: string;
    showCss: boolean;
    showJs: boolean;
  }> = {
    html: {
      label: "HTML / Markup",
      placeholder: '<button class="btn">Klick</button>',
      rows: 7,
      showCss: true,
      showJs: true,
    },
    css: {
      label: "HTML / Markup",
      placeholder: '<button class="btn">Klick</button>',
      rows: 7,
      showCss: true,
      showJs: true,
    },
    tailwind: {
      label: "HTML mit Tailwind-Klassen",
      placeholder: '<button class="rounded-xl bg-violet-600 px-6 py-3 text-white hover:bg-violet-500">Klick</button>',
      rows: 7,
      hint: "Tailwind-Klassen werden in der Vorschau live kompiliert. Eigenes Zusatz-CSS ist optional.",
      showCss: true,
      showJs: true,
    },
    react: {
      label: "React-Komponente (Function Component, JSX)",
      placeholder: "function MeinButton() {\n  const [n, setN] = React.useState(0);\n  return <button onClick={() => setN(n + 1)}>Klicks: {n}</button>;\n}",
      rows: 10,
      hint: "Hooks über React.useState & Co. — Imports sind nicht nötig, React ist global verfügbar.",
      showCss: true,
      showJs: false,
    },
    vue: {
      label: "Vue Single-File-Component (<template> + <script> + <style>)",
      placeholder: "<template>\n  <button @click=\"n++\">Klicks: {{ n }}</button>\n</template>\n\n<script>\nexport default {\n  data: () => ({ n: 0 }),\n};\n</script>\n\n<style>\nbutton { padding: 12px 24px; }\n</style>",
      rows: 14,
      hint: "Alles in einer Datei (Options-API). <style> wird automatisch übernommen.",
      showCss: false,
      showJs: false,
    },
    svelte: {
      label: ".svelte-Datei (Markup + <script> + <style>)",
      placeholder: "<script>\n  let n = 0;\n</script>\n\n<button on:click={() => n++}>Klicks: {n}</button>\n\n<style>\n  button { padding: 12px 24px; }\n</style>",
      rows: 14,
      hint: "Kompletter Svelte-Code in einer Datei — svelte/motion, svelte/transition & Co. können importiert werden.",
      showCss: false,
      showJs: false,
    },
  };
  const spec = CODE_SPEC[framework] ?? CODE_SPEC.html;

  const previewKey = useMemo(
    () => `${framework}:${html}:${css}:${js}`,
    [framework, html, css, js],
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !html.trim()) {
      setError("Titel und Code sind erforderlich.");
      return;
    }
    if (mode === "create" && !licenseOk) {
      setError("Bitte bestätige die Veröffentlichung unter MIT-Lizenz.");
      return;
    }
    setBusy(true);
    const tagList = Array.from(
      new Set(tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)),
    ).slice(0, 8);

    const data = {
      title: title.trim(),
      description: description.trim(),
      html,
      // ausgeblendete Felder nicht mitspeichern (z. B. Alt-CSS nach Framework-Wechsel)
      css: spec.showCss ? css : "",
      js: spec.showJs ? js : "",
      framework,
      category,
      tags: tagList,
    };

    // ---------- EDIT ----------
    if (mode === "edit" && initial) {
      try {
        await databases().updateDocument(DB_ID, COL_COMPONENTS, initial.id, data);
        toast("Änderungen gespeichert", "success");
        router.push(`/c/${initial.slug}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Speichern fehlgeschlagen.");
        toast("Speichern fehlgeschlagen", "error");
        setBusy(false);
      }
      return;
    }

    // ---------- CREATE ----------
    const base = slugify(title);
    const createData = {
      ...data,
      authorId: user.$id,
      authorUsername: user.name || "anon",
      likesCount: 0,
      views: 0,
      a11y: "unchecked",
      createdAt: new Date().toISOString(),
    };
    const perms = [
      Permission.read(Role.any()),
      Permission.update(Role.user(user.$id)),
      Permission.delete(Role.user(user.$id)),
    ];
    for (let attempt = 0; attempt < 3; attempt++) {
      const slug = attempt === 0 ? base : `${base}-${Math.random().toString(36).slice(2, 6)}`;
      try {
        await databases().createDocument(DB_ID, COL_COMPONENTS, ID.unique(), { ...createData, slug }, perms);
        toast("Komponente veröffentlicht", "success");
        router.push(`/c/${slug}`);
        return;
      } catch (err: unknown) {
        const code = (err as { code?: number })?.code;
        if (code === 409) continue;
        setError(err instanceof Error ? err.message : "Speichern fehlgeschlagen.");
        toast("Veröffentlichen fehlgeschlagen", "error");
        setBusy(false);
        return;
      }
    }
    setError("Konnte keinen eindeutigen Link erzeugen. Bitte Titel leicht ändern.");
    setBusy(false);
  }

  const field =
    "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none transition focus:border-accent/50";
  const mono = field + " font-mono";

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-2">
      {/* Formular */}
      <form onSubmit={submit} className="glass space-y-4 rounded-2xl p-6">
        <div>
          <label className="mb-1 block text-sm text-fg-muted">Titel *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={field} placeholder="z. B. Aurora Button" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-fg-muted">Beschreibung</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} className={field} placeholder="Kurz, was die Komponente macht" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm text-fg-muted">Framework</label>
            <select value={framework} onChange={(e) => setFramework(e.target.value as Framework)} className={field}>
              {FRAMEWORKS.map((f) => (
                <option key={f.slug} value={f.slug} className="bg-panel">{f.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-fg-muted">Kategorie</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as Category)} className={field}>
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug} className="bg-panel">{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-fg-muted">Tags (durch Komma getrennt)</label>
          <input value={tags} onChange={(e) => setTags(e.target.value)} className={field} placeholder="gradient, glow, animation" />
        </div>

        <div>
          <label className="mb-1 block text-sm text-fg-muted">{spec.label} *</label>
          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            rows={spec.rows}
            className={mono}
            placeholder={spec.placeholder}
          />
          {spec.hint && <p className="mt-1.5 text-xs text-fg-dim">{spec.hint}</p>}
        </div>
        {spec.showCss && (
          <div>
            <label className="mb-1 block text-sm text-fg-muted">CSS {framework === "react" || framework === "tailwind" ? "(optional)" : ""}</label>
            <textarea value={css} onChange={(e) => setCss(e.target.value)} rows={6} className={mono} placeholder=".btn{ ... }" />
          </div>
        )}
        {spec.showJs && (
          <div>
            <label className="mb-1 block text-sm text-fg-muted">JavaScript (optional)</label>
            <textarea value={js} onChange={(e) => setJs(e.target.value)} rows={4} className={mono} placeholder="// optionales JS" />
          </div>
        )}

        {error && (
          <p className="rounded-lg border border-red-400/20 bg-red-400/5 px-3 py-2 text-sm text-red-300">{error}</p>
        )}

        {/* Open-Source-Zustimmung: Pflicht beim Veröffentlichen (beim Bearbeiten bereits erteilt) */}
        {mode === "create" && (
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-fg-muted transition hover:border-white/20">
            <input
              type="checkbox"
              checked={licenseOk}
              onChange={(e) => setLicenseOk(e.target.checked)}
              required
              className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--accent)]"
            />
            <span>
              Ich veröffentliche diese Komponente unter der{" "}
              <a href="/lizenz" target="_blank" rel="noopener" className="text-fg underline decoration-white/30 underline-offset-2 hover:decoration-accent">
                MIT-Lizenz
              </a>{" "}
              (Open Source, freie private &amp; kommerzielle Nutzung) und bestätige, dass ich die
              Rechte am eingereichten Code besitze und die{" "}
              <a href="/docs/guidelines" target="_blank" rel="noopener" className="text-fg underline decoration-white/30 underline-offset-2 hover:decoration-accent">
                Community-Guidelines
              </a>{" "}
              einhalte.
            </span>
          </label>
        )}

        <button
          type="submit"
          disabled={busy || (mode === "create" && !licenseOk)}
          className="btn-grad flex items-center justify-center gap-2 rounded-xl px-6 py-3 disabled:opacity-60"
        >
          {busy ? <Loader2 size={18} className="animate-spin" /> : mode === "edit" ? <Save size={18} /> : <Upload size={18} />}
          {mode === "edit" ? "Änderungen speichern" : "Unter MIT-Lizenz veröffentlichen"}
        </button>
      </form>

      {/* Live-Vorschau */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-panel">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
            <span className="text-xs font-medium text-fg-muted">Live-Vorschau</span>
            <span className="rounded-md border border-white/10 px-2 py-0.5 text-[11px] text-fg-muted">
              {FRAMEWORKS.find((f) => f.slug === framework)?.label ?? framework}
            </span>
          </div>
          <div className="checker">
            <SandboxPreview key={previewKey} framework={framework} html={html} css={css} js={js} height={340} />
          </div>
        </div>
        <p className="mt-3 text-xs text-fg-dim">
          Die Vorschau läuft in einer sicheren Sandbox. {mode === "edit" ? "Der Link (Slug) bleibt beim Bearbeiten unverändert." : "Nach dem Veröffentlichen ist deine Komponente sofort öffentlich sichtbar."}
        </p>
      </div>
    </div>
  );
}
