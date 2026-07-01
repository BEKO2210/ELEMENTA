"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/** Passwort-Feld mit Auge-Toggle zum Anzeigen/Verbergen. */
export default function PasswordInput({
  value,
  onChange,
  placeholder,
  className = "",
  autoComplete,
  required,
  minLength,
}: {
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  className?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        className={`${className} pr-11`}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        tabIndex={-1}
        aria-label={show ? "Passwort verbergen" : "Passwort anzeigen"}
        title={show ? "Verbergen" : "Anzeigen"}
        className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-fg-dim transition hover:text-fg"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}
