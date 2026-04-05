import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import FeedClient from "@/components/feed/FeedClient";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = { title: "Feed" };

// No static caching — every request gets fresh session data
export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const session = await auth();

  // Guard: no session → login
  if (!session?.user) redirect(ROUTES.LOGIN);

  // Guard: refresh token expired → force sign-out then login
  if (session.error === "RefreshTokenExpired") {
    await signOut({ redirect: false });
    redirect(ROUTES.LOGIN);
  }

  const { id, firstName, lastName } = session.user;
  const authorName = `${firstName} ${lastName}`.trim();

  return (
    <div className="container py-4" style={{ maxWidth: 680 }}>
      <FeedClient
        currentUserId={id}
        authorName={authorName}
      />
    </div>
  );
}
