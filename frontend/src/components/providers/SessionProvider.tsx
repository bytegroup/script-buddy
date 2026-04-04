/**
 * SessionProvider.tsx
 *
 * Wraps the app in Auth.js v5's SessionProvider so client components
 * can call useSession(). Must be a "use client" component because
 * the root layout.tsx is a Server Component.
 */
"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

interface Props {
  children: React.ReactNode;
  session?: Session | null;
}

export default function SessionProvider({ children, session }: Props) {
  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  );
}
