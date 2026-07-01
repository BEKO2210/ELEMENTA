"use client";

import { Upload } from "lucide-react";
import { useAuth } from "./AuthProvider";
import ComponentForm from "./ComponentForm";
import UploadPreview from "./UploadPreview";

export default function SubmitForm() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="mx-auto max-w-2xl px-5 py-24 text-center text-fg-muted">Lädt …</div>;
  }

  if (!user) {
    return <UploadPreview />;
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl btn-grad">
          <Upload size={20} />
        </span>
        <div>
          <h1 className="text-3xl font-bold">Komponente hochladen</h1>
          <p className="mt-0.5 text-fg-muted">
            Teile deine Komponente mit der Community — MIT-Lizenz, mit Live-Vorschau.
          </p>
        </div>
      </div>

      <ComponentForm user={user} mode="create" />
    </div>
  );
}
