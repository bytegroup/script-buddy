import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = { title: "Welcome" };

export default async function HomePage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <main className="d-flex align-items-center justify-content-center min-vh-100">
      <div
        className="card shadow-sm text-center"
        style={{
          maxWidth: 480,
          width: "100%",
          borderRadius: "var(--border-radius-base)",
          padding: "2.5rem 2rem",
          background: "var(--color-card-bg)",
        }}
      >
        <div className="mb-4">
          <Image
            src="/assets/images/logo.svg"
            alt="Appifylab Social Logo"
            width={160}
            height={48}
            priority
          />
        </div>

        <h1 className="h4 mb-2 fw-bold" style={{ color: "var(--color-primary)" }}>
          Appifylab Social
        </h1>

        <p className="text-muted mb-4" style={{ fontSize: "0.95rem" }}>
          Next.js 16 · React 19 · Auth.js v5 · Bootstrap
        </p>

        <div className="d-flex justify-content-center gap-2 flex-wrap mb-4">
          <span className="badge bg-success">Auth.js v5 ✓</span>
          <span className="badge bg-primary">JWT + Refresh ✓</span>
          <span className="badge bg-secondary">proxy.ts ✓</span>
          <span className="badge bg-info text-dark">Bootstrap ✓</span>
        </div>

        <div className="d-grid gap-2">
          {isLoggedIn ? (
            <Link href={ROUTES.FEED} className="btn btn-primary _btn1">
              Go to Feed →
            </Link>
          ) : (
            <>
              <Link href={ROUTES.LOGIN} className="btn btn-primary _btn1">
                Login
              </Link>
              <Link href={ROUTES.REGISTER} className="btn btn-outline-primary">
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
