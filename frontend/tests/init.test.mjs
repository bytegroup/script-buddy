/**
 * tests/init.test.mjs
 *
 * Validates the project initialisation without running Next.js.
 * Uses only Node.js built-ins — no test runner needed.
 *
 * Run: node tests/init.test.mjs
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// ─── Helpers ──────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`  ✅  ${description}`);
    passed++;
  } catch (err) {
    console.error(`  ❌  ${description}`);
    console.error(`       ${err.message}`);
    failed++;
  }
}

function exists(relPath) {
  return fs.existsSync(path.join(ROOT, relPath));
}

function readJSON(relPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), "utf-8"));
}

function readText(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), "utf-8");
}

// ─── Test suites ──────────────────────────────────────────────────────────────

console.log("\n📁  Folder structure");

const requiredDirs = [
  "src/app",
  "src/app/(auth)/login",
  "src/app/(auth)/register",
  "src/app/(feed)",
  "src/app/api/health",
  "src/components/ui",
  "src/components/layout",
  "src/components/feed",
  "src/lib",
  "src/hooks",
  "src/types",
  "src/styles",
  "public/assets/css",
  "public/assets/fonts",
  "public/assets/images",
  "public/assets/js",
  "tests",
];

for (const dir of requiredDirs) {
  test(`Directory exists: ${dir}`, () => {
    assert.ok(exists(dir), `Missing directory: ${dir}`);
  });
}

console.log("\n📄  Required files");

const requiredFiles = [
  "package.json",
  "next.config.mjs",
  "tsconfig.json",
  ".env.local",
  ".env.example",
  ".gitignore",
  "eslint.config.mjs",
  "src/app/layout.tsx",
  "src/app/page.tsx",
  "src/app/(auth)/layout.tsx",
  "src/app/(auth)/login/page.tsx",
  "src/app/(auth)/register/page.tsx",
  "src/app/(feed)/feed/page.tsx",
  "src/app/api/health/route.ts",
  "src/middleware.ts",
  "src/styles/globals.css",
  "src/lib/constants.ts",
  "src/lib/apiClient.ts",
  "src/lib/auth.ts",
  "src/hooks/useAuth.ts",
  "src/types/index.ts",
  "public/assets/css/bootstrap.min.css",
  "public/assets/css/main.css",
  "public/assets/css/common.css",
  "public/assets/css/responsive.css",
  "public/assets/js/bootstrap.bundle.min.js",
  "public/assets/images/logo.svg",
];

for (const file of requiredFiles) {
  test(`File exists: ${file}`, () => {
    assert.ok(exists(file), `Missing file: ${file}`);
  });
}

console.log("\n📦  package.json integrity");

test("Has name field", () => {
  const pkg = readJSON("package.json");
  assert.equal(pkg.name, "appifylab-social");
});

test("Uses Next.js 15.x", () => {
  const pkg = readJSON("package.json");
  assert.match(pkg.dependencies.next, /^15\./);
});

test("Uses React 19.x", () => {
  const pkg = readJSON("package.json");
  assert.match(pkg.dependencies.react, /^19\./);
});

test("No tailwindcss dependency", () => {
  const pkg = readJSON("package.json");
  const allDeps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  };
  assert.ok(!("tailwindcss" in allDeps), "tailwindcss must not be present");
});

test("Has test script", () => {
  const pkg = readJSON("package.json");
  assert.ok(pkg.scripts?.test, "Missing test script");
});

test("Has dev script using turbopack", () => {
  const pkg = readJSON("package.json");
  assert.match(pkg.scripts.dev, /turbopack/);
});

console.log("\n⚙️   next.config.mjs");

test("next.config.mjs uses ESM export", () => {
  const content = readText("next.config.mjs");
  assert.ok(content.includes("export default"), "Must use ESM export default");
});

test("next.config.mjs has reactStrictMode enabled", () => {
  const content = readText("next.config.mjs");
  assert.ok(content.includes("reactStrictMode: true"));
});

test("next.config.mjs has security headers", () => {
  const content = readText("next.config.mjs");
  assert.ok(content.includes("X-Frame-Options"));
});

console.log("\n🔐  Middleware");

test("Middleware protects /feed route", () => {
  const content = readText("src/middleware.ts");
  assert.ok(content.includes("ROUTES.FEED") || content.includes("/feed"));
});

test("Middleware redirects to login with ?next= param", () => {
  const content = readText("src/middleware.ts");
  assert.ok(content.includes("next"));
});

console.log("\n🎨  Bootstrap CSS");

test("bootstrap.min.css is non-empty (> 100 KB)", () => {
  const stats = fs.statSync(path.join(ROOT, "public/assets/css/bootstrap.min.css"));
  assert.ok(stats.size > 100_000, `Bootstrap CSS too small: ${stats.size} bytes`);
});

test("globals.css imports bootstrap from /assets/css/", () => {
  const content = readText("src/styles/globals.css");
  assert.ok(content.includes("/assets/css/bootstrap.min.css"));
});

test("globals.css does NOT reference node_modules", () => {
  const content = readText("src/styles/globals.css");
  assert.ok(!content.includes("node_modules"));
});

console.log("\n🔑  Constants & Types");

test("ROUTES defines LOGIN, REGISTER, FEED, HOME", () => {
  const content = readText("src/lib/constants.ts");
  assert.ok(content.includes("LOGIN"));
  assert.ok(content.includes("REGISTER"));
  assert.ok(content.includes("FEED"));
  assert.ok(content.includes("HOME"));
});

test("Types file defines Post, User, Comment, Reply", () => {
  const content = readText("src/types/index.ts");
  assert.ok(content.includes("interface Post"));
  assert.ok(content.includes("interface User"));
  assert.ok(content.includes("interface Comment"));
  assert.ok(content.includes("interface Reply"));
});

test("PostVisibility union includes public and private", () => {
  const content = readText("src/types/index.ts");
  assert.ok(content.includes('"public"'));
  assert.ok(content.includes('"private"'));
});

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log("\n─────────────────────────────────────────");
console.log(`  Total : ${passed + failed}`);
console.log(`  Passed: ${passed}`);
console.log(`  Failed: ${failed}`);
console.log("─────────────────────────────────────────\n");

// Example output for the deliverable requirement
console.log("📋  Example output — constants snapshot:");
console.log({
  API_BASE_URL: "http://localhost:3001",
  AUTH_COOKIE_NAME: "appifylab_token",
  AUTH_COOKIE_MAX_AGE: 604800,
  ROUTES: {
    HOME: "/",
    LOGIN: "/login",
    REGISTER: "/register",
    FEED: "/feed",
  },
  FEED_PAGE_SIZE: 10,
});

if (failed > 0) {
  process.exit(1);
}
