import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "customer-portal/**",
    "internal-portal/**",
    "memory/**",
    "node_modules/**",
    "download/**",
    "examples/**",
    "skills/**",
    "tmp_prisma/**",
    "src/01_*/**",
    "src/02_*/**",
    "src/03_*/**",
    "src/04_*/**",
    "src/05_*/**",
    "src/06_*/**",
    "temp_original.tsx",
    "fix.js",
    "part1.js",
    "test2.js",
  ]),
]);

export default eslintConfig;
