import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Welcome",
};

export default function HomePage() {
  return (
    <main className="d-flex align-items-center justify-content-center min-vh-100">
      <div
        className="card shadow-sm text-center"
        style={{
          maxWidth: 480,
          width: "100%",
          borderRadius: "var(--border-radius-base)",
          padding: "2.5rem 2rem",
          background: "var(--color-white)",
        }}
      >
        {/* Logo from project assets */}
        <div className="mb-4">
          <Image
            src="/assets/images/logo.svg"
            alt="Appifylab Social Logo"
            width={160}
            height={48}
            priority
          />
        </div>

        <h1
          className="h4 mb-2 fw-bold"
          style={{ color: "var(--color-primary)" }}
        >
          Appifylab Social
        </h1>

        <p className="text-muted mb-4" style={{ fontSize: "0.95rem" }}>
          Next.js 15 · React 19 · Bootstrap · TypeScript
          <br />
          Frontend initialized ✓
        </p>

        {/* Status badges */}
        <div className="d-flex justify-content-center gap-2 flex-wrap mb-4">
          <span className="badge bg-success">Bootstrap CSS ✓</span>
          <span className="badge bg-primary">App Router ✓</span>
          <span className="badge bg-secondary">TypeScript ✓</span>
          <span className="badge bg-info text-dark">Env Config ✓</span>
        </div>

        {/* Navigation to future pages */}
        <div className="d-grid gap-2">
          <Link
            href="/login"
            className="btn btn-primary"
            style={{ borderRadius: "var(--border-radius-pill)" }}
          >
            Go to Login
          </Link>
          <Link
            href="/register"
            className="btn btn-outline-primary"
            style={{ borderRadius: "var(--border-radius-pill)" }}
          >
            Go to Register
          </Link>
        </div>

        <hr className="my-4" />
        <p className="text-muted mb-0" style={{ fontSize: "0.8rem" }}>
          Backend:{" "}
          <code>{process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001"}</code>
        </p>
      </div>
    </main>
  );
}
