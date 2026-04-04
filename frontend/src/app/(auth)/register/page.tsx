/**
 * Register page — Server Component
 *
 * Server-side redirect: if already authenticated, send to /feed.
 * Otherwise render the client RegisterForm.
 */
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import RegisterForm from "@/components/auth/RegisterForm";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = { title: "Register" };

export default async function RegisterPage() {
  const session = await auth();

  // Already logged in → go to feed
  if (session?.user) {
    redirect(ROUTES.FEED);
  }

  return <RegisterForm />;
}
