import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      avatarUrl?: string;
    };
    accessToken: string;
    accessTokenExpiresAt: number;
    error?: "RefreshTokenExpired" | "RefreshTokenError";
  }

  interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: number;
    refreshTokenExpiresAt: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
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