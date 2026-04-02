import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = { title: "Register" };

export default function RegisterPage() {
  return (
    <div
      className="card shadow-sm p-4 text-center"
      style={{ maxWidth: 420, width: "100%" }}
    >
      <h2 className="h5 fw-bold mb-1">Create Account</h2>
      <p className="text-muted small mb-3">
        Registration UI coming in the next step.
      </p>
      <Link href={ROUTES.HOME} className="btn btn-outline-secondary btn-sm">
        ← Back to Home
      </Link>
    </div>
  );
}
