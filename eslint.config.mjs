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
  ]),
  {
    rules: {
      // setLoading(true) at the top of useEffect is intentional for loading state control
      "react-hooks/set-state-in-effect": "off",
      // react-hook-form watch() incompatibility is informational only
      "react-hooks/incompatible-library": "warn",
    },
  },
]);

export default eslintConfig;
