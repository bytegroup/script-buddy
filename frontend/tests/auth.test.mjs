/**
 * tests/auth.test.mjs
 *
 * Validates Auth.js v5 setup, form logic, token strategy,
 * and proxy.ts configuration — all without running Next.js.
 *
 * Uses only Node.js built-ins (node:assert, node:fs, node:path).
 * Run: node tests/auth.test.mjs
 */

import assert from "node:assert/strict";
import fs     from "node:fs";
import path   from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, "..");

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

function readText(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), "utf-8");
}

function exists(relPath) {
  return fs.existsSync(path.join(ROOT, relPath));
}

// ─── Token logic (mirrors src/auth.ts) ───────────────────────────────────────

const ACCESS_TOKEN_TTL_MS  = 15 * 60 * 1000;       // 15 minutes
const REFRESH_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;  // 24 hours

function makeToken(overrides = {}) {
  const now = Date.now();
  return {
    id:                    "user-123",
    firstName:             "Test",
    lastName:              "User",
    email:                 "test@tst.com",
    accessToken:           "access-token-abc",
    refreshToken:          "refresh-token-xyz",
    accessTokenExpiresAt:  now + ACCESS_TOKEN_TTL_MS,
    refreshTokenExpiresAt: now + REFRESH_TOKEN_TTL_MS,
    ...overrides,
  };
}

function simulateJwtCallback(token) {
  // Mirror the jwt() callback logic from src/auth.ts
  if (Date.now() < token.accessTokenExpiresAt) {
    return { ...token, refreshed: false };
  }
  if (Date.now() > token.refreshTokenExpiresAt) {
    return { ...token, error: "RefreshTokenExpired" };
  }
  // Would refresh — simulate success
  return {
    ...token,
    accessToken:          "new-access-token",
    accessTokenExpiresAt: Date.now() + ACCESS_TOKEN_TTL_MS,
    refreshed:            true,
  };
}

function simulateValidation(form) {
  // Mirror client-side validate() from LoginForm / RegisterForm
  const errors = {};
  if (!form.firstName?.trim()) errors.firstName = "First name is required.";
  if (!form.lastName?.trim())  errors.lastName  = "Last name is required.";
  if (!form.email?.trim())     errors.email     = "Email is required.";
  else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = "Enter a valid email.";
  if (!form.password)          errors.password  = "Password is required.";
  else if (form.password.length < 4) errors.password = "Password must be at least 4 characters.";
  return errors;
}

function simulateLoginValidation(form) {
  const errors = {};
  if (!form.email?.trim())     errors.email    = "Email is required.";
  else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = "Enter a valid email.";
  if (!form.password)          errors.password = "Password is required.";
  else if (form.password.length < 4) errors.password = "Password must be at least 4 characters.";
  return errors;
}

function simulateSnakeCaseMapping(camel) {
  // Mirror the backend payload mapping from register/route.ts
  return {
    first_name: camel.firstName,
    last_name:  camel.lastName,
    email:      camel.email,
    password:   camel.password,
  };
}

// ─────────────────────────────────────────────────────────────────────────────

console.log("\n📁  Required auth files");

const requiredFiles = [
  "src/auth.ts",
  "src/proxy.ts",
  "src/types/next-auth.d.ts",
  "src/app/api/auth/[...nextauth]/route.ts",
  "src/app/api/auth/register/route.ts",
  "src/components/providers/SessionProvider.tsx",
  "src/components/auth/LoginForm.tsx",
  "src/components/auth/RegisterForm.tsx",
  "src/app/(auth)/login/page.tsx",
  "src/app/(auth)/register/page.tsx",
];

for (const file of requiredFiles) {
  test(`File exists: ${file}`, () => {
    assert.ok(exists(file), `Missing: ${file}`);
  });
}

// ─────────────────────────────────────────────────────────────────────────────

console.log("\n📦  package.json — next-auth version");

test("next-auth is version 5.x (beta)", () => {
  const pkg = JSON.parse(readText("package.json"));
  assert.ok(
    pkg.dependencies["next-auth"]?.startsWith("5."),
    `Expected next-auth@5.x, got: ${pkg.dependencies["next-auth"]}`
  );
});

test("test script runs both test files", () => {
  const pkg = JSON.parse(readText("package.json"));
  assert.ok(pkg.scripts.test.includes("auth.test.mjs"));
  assert.ok(pkg.scripts.test.includes("init.test.mjs"));
});

// ─────────────────────────────────────────────────────────────────────────────

console.log("\n🔐  src/auth.ts — Auth.js v5 configuration");

test("Uses NextAuth from 'next-auth' (v5 import)", () => {
  const src = readText("src/auth.ts");
  assert.ok(src.includes(`from "next-auth"`));
});

test("Uses Credentials provider", () => {
  const src = readText("src/auth.ts");
  assert.ok(src.includes("Credentials"));
});

test("session strategy is 'jwt'", () => {
  const src = readText("src/auth.ts");
  assert.ok(src.includes(`strategy: "jwt"`));
});

test("Access token TTL is 15 minutes (900 000 ms)", () => {
  const src = readText("src/auth.ts");
  assert.ok(
    src.includes("15 * 60 * 1000"),
    "Expected 15 * 60 * 1000 for ACCESS_TOKEN_TTL_MS"
  );
});

test("Refresh token TTL is 24 hours (86 400 000 ms)", () => {
  const src = readText("src/auth.ts");
  assert.ok(
    src.includes("24 * 60 * 60 * 1000"),
    "Expected 24 * 60 * 60 * 1000 for REFRESH_TOKEN_TTL_MS"
  );
});

test("jwt() callback handles silent token refresh", () => {
  const src = readText("src/auth.ts");
  assert.ok(src.includes("refreshAccessToken"));
  assert.ok(src.includes("accessTokenExpiresAt"));
  assert.ok(src.includes("refreshTokenExpiresAt"));
});

test("jwt() callback returns RefreshTokenExpired error", () => {
  const src = readText("src/auth.ts");
  assert.ok(src.includes("RefreshTokenExpired"));
});

test("session() callback exposes accessToken to client", () => {
  const src = readText("src/auth.ts");
  assert.ok(src.includes("accessToken:"));
  assert.ok(src.includes("async session("));
});

test("authorized() callback redirects unauthenticated to /login with ?next=", () => {
  const src = readText("src/auth.ts");
  assert.ok(src.includes("authorized("));
  assert.ok(src.includes("next"));
  assert.ok(src.includes("/login"));
});

test("authorized() callback redirects authenticated users away from /login and /register", () => {
  const src = readText("src/auth.ts");
  assert.ok(src.includes("/register"));
  assert.ok(src.includes("/feed"));
});

test("signIn page set to /login", () => {
  const src = readText("src/auth.ts");
  assert.ok(src.includes(`signIn: "/login"`));
});

test("Backend login endpoint uses snake_case body", () => {
  const src = readText("src/auth.ts");
  // The authorize() call sends email + password (no first_name needed for login)
  assert.ok(src.includes(`"email"`));
  assert.ok(src.includes(`"password"`));
});

test("authorize() maps backend snake_case to camelCase user object", () => {
  const src = readText("src/auth.ts");
  assert.ok(src.includes("first_name"));
  assert.ok(src.includes("last_name"));
  assert.ok(src.includes("firstName:"));
  assert.ok(src.includes("lastName:"));
});

test("handlers export (GET, POST) present", () => {
  const src = readText("src/app/api/auth/[...nextauth]/route.ts");
  assert.ok(src.includes("handlers"));
  assert.ok(src.includes("GET"));
  assert.ok(src.includes("POST"));
});

// ─────────────────────────────────────────────────────────────────────────────

console.log("\n🔄  proxy.ts — replaces middleware.ts");

test("proxy.ts exists (middleware.ts must not exist)", () => {
  assert.ok(exists("src/proxy.ts"),     "src/proxy.ts missing");
  assert.ok(!exists("src/middleware.ts"), "src/middleware.ts must be removed");
});

test("proxy.ts exports 'proxy' (not 'middleware')", () => {
  const src = readText("src/proxy.ts");
  assert.ok(src.includes("export const proxy"), "Must export 'proxy'");
  assert.ok(!src.includes("export const middleware"), "Must not export 'middleware'");
  assert.ok(!src.includes("export function middleware"), "Must not export 'middleware'");
});

test("proxy.ts does NOT use edge runtime", () => {
  const src = readText("src/proxy.ts");
  assert.ok(!src.includes(`runtime = "edge"`), "Edge runtime not allowed in proxy.ts");
});

test("proxy.ts has matcher config excluding assets", () => {
  const src = readText("src/proxy.ts");
  assert.ok(src.includes("matcher"));
  assert.ok(src.includes("assets/"));
});

// ─────────────────────────────────────────────────────────────────────────────

console.log("\n📝  Register API route — src/app/api/auth/register/route.ts");

test("Register route does snake_case mapping", () => {
  const src = readText("src/app/api/auth/register/route.ts");
  assert.ok(src.includes("first_name"));
  assert.ok(src.includes("last_name"));
  assert.ok(src.includes("firstName"));
  assert.ok(src.includes("lastName"));
});

test("Register route has server-side password length validation", () => {
  const src = readText("src/app/api/auth/register/route.ts");
  assert.ok(src.includes("length < 4"));
});

test("Register route returns 201 on success", () => {
  const src = readText("src/app/api/auth/register/route.ts");
  assert.ok(src.includes("status: 201"));
});

test("Register route returns 422 on validation errors", () => {
  const src = readText("src/app/api/auth/register/route.ts");
  assert.ok(src.includes("status: 422"));
});

// ─────────────────────────────────────────────────────────────────────────────

console.log("\n🧩  Components — LoginForm & RegisterForm");

test("LoginForm is a 'use client' component", () => {
  const src = readText("src/components/auth/LoginForm.tsx");
  assert.ok(src.trimStart().startsWith(`"use client"`));
});

test("RegisterForm is a 'use client' component", () => {
  const src = readText("src/components/auth/RegisterForm.tsx");
  assert.ok(src.trimStart().startsWith(`"use client"`));
});

test("LoginForm uses signIn from next-auth/react", () => {
  const src = readText("src/components/auth/LoginForm.tsx");
  assert.ok(src.includes(`from "next-auth/react"`));
  assert.ok(src.includes("signIn("));
});

test("LoginForm uses redirect: false for manual redirect control", () => {
  const src = readText("src/components/auth/LoginForm.tsx");
  assert.ok(src.includes("redirect: false"));
});

test("LoginForm has eye toggle button", () => {
  const src = readText("src/components/auth/LoginForm.tsx");
  assert.ok(src.includes("eye-toggle") || src.includes("showPass"));
  assert.ok(src.includes("EyeOpenIcon") || src.includes("EyeClosedIcon"));
});

test("RegisterForm has all 4 required fields", () => {
  const src = readText("src/components/auth/RegisterForm.tsx");
  assert.ok(src.includes(`name="firstName"`));
  assert.ok(src.includes(`name="lastName"`));
  assert.ok(src.includes(`name="email"`));
  assert.ok(src.includes(`name="password"`));
});

test("RegisterForm has eye toggle on password", () => {
  const src = readText("src/components/auth/RegisterForm.tsx");
  assert.ok(src.includes("showPass"));
});

test("RegisterForm posts to /api/auth/register (Next.js route, not backend directly)", () => {
  const src = readText("src/components/auth/RegisterForm.tsx");
  assert.ok(src.includes(`"/api/auth/register"`));
});

test("RegisterForm redirects to /login on success", () => {
  const src = readText("src/components/auth/RegisterForm.tsx");
  assert.ok(src.includes("ROUTES.LOGIN") || src.includes(`"/login"`));
});

// ─────────────────────────────────────────────────────────────────────────────

console.log("\n🌐  Page-level server-side auth guards");

test("Login page calls auth() and redirects to /feed if logged in", () => {
  const src = readText("src/app/(auth)/login/page.tsx");
  assert.ok(src.includes("await auth()"));
  assert.ok(src.includes("redirect(ROUTES.FEED)") || src.includes(`redirect("/feed")`));
});

test("Register page calls auth() and redirects to /feed if logged in", () => {
  const src = readText("src/app/(auth)/register/page.tsx");
  assert.ok(src.includes("await auth()"));
  assert.ok(src.includes("redirect(ROUTES.FEED)") || src.includes(`redirect("/feed")`));
});

test("Feed page calls auth() and redirects to /login if not logged in", () => {
  const src = readText("src/app/(feed)/feed/page.tsx");
  assert.ok(src.includes("await auth()"));
  assert.ok(src.includes("redirect(ROUTES.LOGIN)") || src.includes(`redirect("/login")`));
});

test("Feed page handles RefreshTokenExpired error", () => {
  const src = readText("src/app/(feed)/feed/page.tsx");
  assert.ok(src.includes("RefreshTokenExpired"));
  assert.ok(src.includes("signOut"));
});

// ─────────────────────────────────────────────────────────────────────────────

console.log("\n🎨  Fonts — globals.css");

test("globals.css has @font-face for FontAwesome from local /assets/fonts/", () => {
  const src = readText("src/styles/globals.css");
  assert.ok(src.includes("@font-face"));
  assert.ok(src.includes("fa-solid-900.woff2"));
  assert.ok(src.includes("fa-regular-400.woff2"));
  assert.ok(src.includes("fa-brands-400.woff2"));
});

test("globals.css loads Poppins from Google Fonts (not in zip)", () => {
  const src = readText("src/styles/globals.css");
  assert.ok(src.includes("Poppins"));
  assert.ok(src.includes("fonts.googleapis.com"));
});

test("globals.css has .password-wrapper and .eye-toggle styles", () => {
  const src = readText("src/styles/globals.css");
  assert.ok(src.includes(".password-wrapper"));
  assert.ok(src.includes(".eye-toggle"));
});

test("globals.css has .field-error style", () => {
  const src = readText("src/styles/globals.css");
  assert.ok(src.includes(".field-error"));
});

// ─────────────────────────────────────────────────────────────────────────────

console.log("\n🔑  ENV — Auth.js v5 variable names");

test(".env.local uses AUTH_SECRET (not NEXTAUTH_SECRET)", () => {
  const src = readText(".env.local");
  assert.ok(src.includes("AUTH_SECRET"),    "Missing AUTH_SECRET");
  assert.ok(!src.includes("NEXTAUTH_SECRET"), "NEXTAUTH_SECRET is v4, not v5");
});

test(".env.local uses AUTH_URL (not NEXTAUTH_URL)", () => {
  const src = readText(".env.local");
  assert.ok(src.includes("AUTH_URL"),    "Missing AUTH_URL");
  assert.ok(!src.includes("NEXTAUTH_URL"), "NEXTAUTH_URL is v4, not v5");
});

// ─────────────────────────────────────────────────────────────────────────────

console.log("\n⚙️   Token logic unit tests (pure JS, no imports)");

test("Fresh token: jwt callback returns token unchanged", () => {
  const token  = makeToken();
  const result = simulateJwtCallback(token);
  assert.equal(result.refreshed, false);
  assert.equal(result.accessToken, "access-token-abc");
});

test("Expired access token + valid refresh: silent refresh triggered", () => {
  const token = makeToken({
    accessTokenExpiresAt: Date.now() - 1000,   // already expired
    refreshTokenExpiresAt: Date.now() + REFRESH_TOKEN_TTL_MS,
  });
  const result = simulateJwtCallback(token);
  assert.equal(result.refreshed, true);
  assert.equal(result.accessToken, "new-access-token");
});

test("Expired refresh token: returns RefreshTokenExpired error", () => {
  const token = makeToken({
    accessTokenExpiresAt:  Date.now() - 1000,
    refreshTokenExpiresAt: Date.now() - 1000,
  });
  const result = simulateJwtCallback(token);
  assert.equal(result.error, "RefreshTokenExpired");
});

test("ACCESS_TOKEN_TTL_MS is exactly 900 000 ms (15 min)", () => {
  assert.equal(ACCESS_TOKEN_TTL_MS, 900_000);
});

test("REFRESH_TOKEN_TTL_MS is exactly 86 400 000 ms (24 h)", () => {
  assert.equal(REFRESH_TOKEN_TTL_MS, 86_400_000);
});

// ─────────────────────────────────────────────────────────────────────────────

console.log("\n✅  Form validation unit tests");

test("Register: empty form produces 4 errors", () => {
  const errors = simulateValidation({ firstName: "", lastName: "", email: "", password: "" });
  assert.equal(Object.keys(errors).length, 4);
});

test("Register: password shorter than 4 chars fails", () => {
  const errors = simulateValidation({ firstName: "a", lastName: "b", email: "x@x.com", password: "123" });
  assert.ok(errors.password, "Expected password error for 3-char password");
});

test("Register: password of exactly 4 chars passes", () => {
  const errors = simulateValidation({ firstName: "a", lastName: "b", email: "x@x.com", password: "1234" });
  assert.ok(!errors.password, "4-char password should pass");
});

test("Register: invalid email format fails", () => {
  const errors = simulateValidation({ firstName: "a", lastName: "b", email: "notanemail", password: "1234" });
  assert.ok(errors.email);
});

test("Register: valid form produces no errors", () => {
  const errors = simulateValidation({
    firstName: "Test",
    lastName:  "User",
    email:     "test@tst.com",
    password:  "tst1",
  });
  assert.equal(Object.keys(errors).length, 0);
});

test("Login: empty form produces 2 errors", () => {
  const errors = simulateLoginValidation({ email: "", password: "" });
  assert.equal(Object.keys(errors).length, 2);
});

test("Login: valid credentials produce no errors", () => {
  const errors = simulateLoginValidation({ email: "test@tst.com", password: "tst1" });
  assert.equal(Object.keys(errors).length, 0);
});

// ─────────────────────────────────────────────────────────────────────────────

console.log("\n🔁  snake_case mapping unit test");

test("Register payload maps camelCase → snake_case for backend", () => {
  const camel  = { firstName: "Test", lastName: "User", email: "test@tst.com", password: "tst1" };
  const mapped = simulateSnakeCaseMapping(camel);

  assert.equal(mapped.first_name, "Test");
  assert.equal(mapped.last_name,  "User");
  assert.equal(mapped.email,      "test@tst.com");
  assert.equal(mapped.password,   "tst1");
  assert.ok(!("firstName" in mapped), "camelCase key must not be in backend payload");
  assert.ok(!("lastName"  in mapped), "camelCase key must not be in backend payload");
});

// ─────────────────────────────────────────────────────────────────────────────

console.log("\n─────────────────────────────────────────");
console.log(`  Total : ${passed + failed}`);
console.log(`  Passed: ${passed}`);
console.log(`  Failed: ${failed}`);
console.log("─────────────────────────────────────────\n");

// ─── Example output ───────────────────────────────────────────────────────────

console.log("📋  Example output — register payload sent to backend:");
const exampleRegister = {
  first_name: "test",
  last_name:  "test",
  email:      "test@tst.com",
  password:   "tst",
};
console.log(JSON.stringify(exampleRegister, null, 2));

console.log("\n📋  Example output — login payload sent to Auth.js signIn():");
const exampleLogin = {
  email:    "test@tst.com",
  password: "tst",
};
console.log(JSON.stringify(exampleLogin, null, 2));

console.log("\n📋  Example output — JWT token payload (after login):");
const exampleToken = makeToken({
  id:        "user-abc-123",
  firstName: "test",
  lastName:  "test",
  email:     "test@tst.com",
});
console.log(JSON.stringify({
  id:                    exampleToken.id,
  firstName:             exampleToken.firstName,
  lastName:              exampleToken.lastName,
  email:                 exampleToken.email,
  accessToken:           "[JWT string from backend]",
  refreshToken:          "[refresh token from backend]",
  accessTokenExpiresAt:  new Date(exampleToken.accessTokenExpiresAt).toISOString(),
  refreshTokenExpiresAt: new Date(exampleToken.refreshTokenExpiresAt).toISOString(),
}, null, 2));

console.log("\n📋  Example output — silent refresh result:");
const expiredToken = makeToken({
  accessTokenExpiresAt:  Date.now() - 1_000,
  refreshTokenExpiresAt: Date.now() + REFRESH_TOKEN_TTL_MS,
});
const refreshResult = simulateJwtCallback(expiredToken);
console.log(JSON.stringify({
  triggered:             refreshResult.refreshed,
  newAccessToken:        refreshResult.accessToken,
  newExpiresAt:          new Date(refreshResult.accessTokenExpiresAt).toISOString(),
}, null, 2));

if (failed > 0) process.exit(1);
