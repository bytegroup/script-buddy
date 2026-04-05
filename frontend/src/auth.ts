/**
 * auth.ts  — Auth.js v5 (next-auth@5) configuration
 *
 * Single source of truth for all auth logic.
 * Exported `auth`, `signIn`, `signOut`, `handlers` are used throughout the app.
 *
 * Token strategy:
 *   - Access token  : 15 minutes (from backend)
 *   - Refresh token : 24 hours   (from backend)
 *   - JWT callback silently refreshes the access token when it expires
 *     as long as the refresh token is still valid.
 */

import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import {API_BASE_URL, API_ENDPOINTS, PUBLIC_PATHS} from "@/lib/constants";

// ─── Token durations ──────────────────────────────────────────────────────────
const ACCESS_TOKEN_TTL_MS  = 15 * 60 * 1000;       // 15 minutes
const REFRESH_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;  // 24 hours

// ─── Helper: call backend to exchange refresh token for new tokens ─────────────
async function refreshAccessToken(refreshToken: string) {
  try {
    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.REFRESH_TOKEN}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) throw new Error(`Refresh failed: ${res.status}`);

    const data = await res.json();

    return {
      accessToken: data.access_token as string,
      refreshToken: (data.refresh_token ?? refreshToken) as string,
      accessTokenExpiresAt: Date.now() + ACCESS_TOKEN_TTL_MS,
      refreshTokenExpiresAt: Date.now() + REFRESH_TOKEN_TTL_MS,
      error: undefined,
    };
  } catch {
    return { error: "RefreshTokenError" as const };
  }
}

// ─── Auth.js configuration ────────────────────────────────────────────────────
export const authConfig: NextAuthConfig = {
  // Use JWT strategy (no database adapter)
  session: {
    strategy: "jwt",
    // Session cookie max-age: match refresh token lifetime
    maxAge: REFRESH_TOKEN_TTL_MS / 1000,
  },

  // Custom page routes
  pages: {
    signIn: "/login",
    error: "/login",
  },

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOGIN}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email:    credentials.email,
              password: credentials.password,
            }),
          });

          // authorize() must return null on failure — never throw
          if (!res.ok) return null;

          const data = await res.json();

          // Map backend snake_case → our User shape
          return {
            id:                    String(data.user?.id ?? data.id ?? ""),
            firstName:             data.user?.first_name ?? data.first_name ?? "",
            lastName:              data.user?.last_name  ?? data.last_name  ?? "",
            email:                 data.user?.email      ?? data.email      ?? "",
            avatarUrl:             data.user?.avatar_url ?? undefined,
            accessToken:           data.access_token,
            refreshToken:          data.refresh_token,
            accessTokenExpiresAt:  Date.now() + ACCESS_TOKEN_TTL_MS,
            refreshTokenExpiresAt: Date.now() + REFRESH_TOKEN_TTL_MS,
          };
        } catch {
          return null;
        }
      },
    }),
  ],

  callbacks: {
    /**
     * jwt() — persists user data into the encrypted JWT cookie.
     * Called on every sign-in, token refresh, and session check.
     */
    async jwt({ token, user, account }) {
      // Initial sign-in: copy User fields into JWT
      if (account && user) {
        return {
          ...token,
          id:                    user.id,
          firstName:             user.firstName,
          lastName:              user.lastName,
          email:                 user.email,
          avatarUrl:             user.avatarUrl,
          accessToken:           user.accessToken,
          refreshToken:          user.refreshToken,
          accessTokenExpiresAt:  user.accessTokenExpiresAt,
          refreshTokenExpiresAt: user.refreshTokenExpiresAt,
        };
      }

      // Token still valid — return as-is
      if (Date.now() < token.accessTokenExpiresAt) {
        return token;
      }

      // Refresh token itself is expired — force re-login
      if (Date.now() > token.refreshTokenExpiresAt) {
        return { ...token, error: "RefreshTokenExpired" as const };
      }

      // Access token expired but refresh token is valid — silently refresh
      const refreshed = await refreshAccessToken(token.refreshToken);
      if (refreshed.error) {
        return { ...token, error: refreshed.error };
      }

      return {
        ...token,
        accessToken:           refreshed.accessToken!,
        refreshToken:          refreshed.refreshToken!,
        accessTokenExpiresAt:  refreshed.accessTokenExpiresAt!,
        refreshTokenExpiresAt: refreshed.refreshTokenExpiresAt!,
        error:                 undefined,
      };
    },

    /**
     * session() — shapes what useSession() / auth() returns to the client.
     * Never put secrets here; only safe-to-expose fields.
     */
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id:        token.id,
          firstName: token.firstName,
          lastName:  token.lastName,
          email:     token.email,
          avatarUrl: token.avatarUrl,
        },
        accessToken:          token.accessToken,
        accessTokenExpiresAt: token.accessTokenExpiresAt,
        error:                token.error,
      };
    },

    /**
     * authorized() — called by proxy.ts to gate every request.
     * Return true to allow, false to redirect to signIn page.
     */
    authorized({auth, request}) {
      const {pathname} = request.nextUrl;

      if (pathname.startsWith("/api/auth")) return true;
      if (PUBLIC_PATHS.includes(pathname)) return true;
      return !!auth?.user;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
