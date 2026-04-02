"use client";

import { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import { AUTH_COOKIE_NAME, ROUTES } from "@/lib/constants";
import { decodeTokenPayload, isTokenExpired } from "@/lib/auth";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface UseAuthReturn extends AuthState {
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const token = Cookies.get(AUTH_COOKIE_NAME);

    if (!token) {
      setState({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    const payload = decodeTokenPayload(token);

    if (!payload || isTokenExpired(payload)) {
      Cookies.remove(AUTH_COOKIE_NAME);
      setState({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    // Minimal user shape from token — full profile fetched separately
    setState({
      user: {
        id: payload.sub,
        email: payload.email,
        firstName: "",
        lastName: "",
        createdAt: "",
      },
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const logout = useCallback(() => {
    Cookies.remove(AUTH_COOKIE_NAME);
    window.location.href = ROUTES.LOGIN;
  }, []);

  return { ...state, logout };
}
