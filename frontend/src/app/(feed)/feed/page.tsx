import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import FeedClient from "@/components/feed/FeedClient";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = { title: "Feed" };
export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const session = await auth();

  if (!session?.user) redirect(ROUTES.LOGIN);

  if (session.error === "RefreshTokenExpired") {
    await signOut({ redirect: false });
    redirect(ROUTES.LOGIN);
  }

  const { id, firstName, lastName } = session.user;
  const authorName = `${firstName} ${lastName}`.trim();

  return (
      <FeedClient
          currentUserId={id}
          authorName={authorName}
      />
  );
}
