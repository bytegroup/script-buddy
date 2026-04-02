import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, AUTH_COOKIE_MAX_AGE, ROUTES } from "./constants";
import type { AuthTokenPayload } from "@/types";

// ─── Set auth cookie (server action / route handler) ──────────────────────────

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: AUTH_COOKIE_MAX_AGE,
    path: "/",
  });
}

// ─── Clear auth cookie ────────────────────────────────────────────────────────

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

// ─── Get raw token from cookie (server-side only) ─────────────────────────────

export async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value;
}

// ─── Decode JWT payload without verifying (lightweight, client-safe preview) ──
// Full verification must happen server-side using jose.

export function decodeTokenPayload(token: string): AuthTokenPayload | null {
  try {
    const base64Payload = token.split(".")[1];
    if (!base64Payload) return null;
    const json = Buffer.from(base64Payload, "base64url").toString("utf-8");
    return JSON.parse(json) as AuthTokenPayload;
  } catch {
    return null;
  }
}

// ─── Check if a decoded token is expired ─────────────────────────────────────

export function isTokenExpired(payload: AuthTokenPayload): boolean {
  return Date.now() >= payload.exp * 1000;
}

// ─── Redirect path after login ────────────────────────────────────────────────

export function getPostLoginRedirect(searchParams?: URLSearchParams): string {
  const next = searchParams?.get("next");
  // Only allow relative paths to prevent open redirect attacks
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }
  return ROUTES.FEED;
}
