/**
 * Extends the built-in NextAuth v5 (Auth.js) types so TypeScript
 * knows about our custom fields on Session and JWT.
 */
import type { DefaultSession, DefaultJWT } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      avatarUrl?: string;
    } & DefaultSession["user"];
    /** The raw access token forwarded to the client for API calls */
    accessToken: string;
    /** UTC epoch (ms) when the access token expires */
    accessTokenExpiresAt: number;
    error?: "RefreshTokenExpired" | "RefreshTokenError";
  }

  interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
    /** Issued by our backend on login */
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: number;
    refreshTokenExpiresAt: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: number;
    refreshTokenExpiresAt: number;
    error?: "RefreshTokenExpired" | "RefreshTokenError";
  }
}
