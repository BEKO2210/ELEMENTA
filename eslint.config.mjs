import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Gebündelte Fremdbibliotheken (kein Projektcode) — nicht linten.
    "public/vendor/**",
    // Node-Hilfsskripte + Test-Artefakte.
    "scripts/**",
    "test-results/**",
    "playwright-report/**",
  ]),
  {
    rules: {
      // React-Compiler-Hinweise (Perf/Strictness), im Projekt bewusst so
      // umgesetzt. Als Warnung sichtbar, aber kein CI-Blocker.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
    },
  },
]);

export default eslintConfig;
