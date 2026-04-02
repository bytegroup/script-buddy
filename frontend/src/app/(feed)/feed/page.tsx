import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = { title: "Feed" };

export default function FeedPage() {
  return (
    <main className="container py-5 text-center">
      <h1 className="h4 fw-bold mb-2">Feed</h1>
      <p className="text-muted small mb-3">
        Feed UI coming in the next step. This is a protected route — middleware
        will redirect unauthenticated users to login.
      </p>
      <Link href={ROUTES.HOME} className="btn btn-outline-secondary btn-sm">
        ← Back to Home
      </Link>
    </main>
  );
}
