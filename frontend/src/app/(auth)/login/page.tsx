import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import LoginForm from "@/components/auth/LoginForm";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = { title: "Login" };

export default async function LoginPage() {
  const session = await auth();

  // Already logged in → go to feed
  if (session?.user) {
    redirect(ROUTES.FEED);
  }

  return <LoginForm />;
}
