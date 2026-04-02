import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Enforce no unused variables
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      // Prevent accidental console.log in production
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
];

export default eslintConfig;
