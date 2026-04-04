/**
 * proxy.ts  — Next.js 16 replacement for middleware.ts
 *
* proxy.ts runs on the Node.js runtime (not configurable).
 * Auth.js v5 authorized() callback (defined in auth.ts) handles all
 * redirect logic — this file just wires it in.
 *
 * Migration from middleware.ts:
 *   1. Renamed file: middleware.ts → proxy.ts
 *   2. Renamed export: `middleware` → `proxy`
* 3. Renamed export: middleware → proxy
 */

import { auth } from "@/auth";

// auth() used as proxy handler — delegates to the authorized() callback
// defined in authConfig inside src/auth.ts
export const proxy = auth;

export const config = {
  // Run on all routes except Next.js internals and static assets
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|assets/).*)",
  ],
};
