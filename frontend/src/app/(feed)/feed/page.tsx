/**
 * Feed page — Server Component (protected route)
 *
 * auth() returns null if not authenticated — proxy.ts handles the
 * redirect before the page even renders, but we add a server-side
 * guard here as a belt-and-suspenders safety measure.
 *
 * Also detects a RefreshTokenExpired error and forces sign-out.
 */
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = { title: "Feed" };

export default async function FeedPage() {
  const session = await auth();

  if (!session?.user) {
    redirect(ROUTES.LOGIN);
  }

  // Refresh token expired — force sign-out and redirect to login
  if (session.error === "RefreshTokenExpired") {
    await signOut({ redirect: false });
    redirect(ROUTES.LOGIN);
  }

  const { firstName, lastName, email } = session.user;

  return (
    <main className="container py-5">
      <div className="card shadow-sm p-4">
        <h1 className="h4 fw-bold mb-1">
          Welcome, {firstName} {lastName}!
        </h1>
        <p className="text-muted small mb-3">{email}</p>
        <p className="text-muted mb-4">
          Feed UI is coming in the next step. You are authenticated ✓
        </p>

        {/* Token debug info — dev only */}
        {process.env.NODE_ENV === "development" && (
          <div
            className="p-3 mb-4 rounded"
            style={{ background: "#f8f9fa", fontSize: "0.78rem", fontFamily: "monospace" }}
          >
            <strong>Session debug (dev only)</strong>
            <br />
            Access token expires:{" "}
            {new Date(session.accessTokenExpiresAt).toLocaleTimeString()}
          </div>
        )}

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: ROUTES.LOGIN });
          }}
        >
          <button type="submit" className="btn btn-outline-danger btn-sm">
            Sign out
          </button>
        </form>

        <hr className="my-4" />
        <Link href={ROUTES.HOME} className="btn btn-outline-secondary btn-sm">
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}
