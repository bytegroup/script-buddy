import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { auth } from "@/auth";
import SessionProvider from "@/components/providers/SessionProvider";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Appifylab Social",
    template: "%s | Appifylab Social",
  },
  description: "A social platform built with Next.js 16 & Auth.js v5",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // auth() is the v5 equivalent of getServerSession()
  // Pass session to SessionProvider to avoid an extra round-trip
  const session = await auth();

  return (
    <html lang="en">
      <body>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>

        <Script
          src="/assets/js/bootstrap.bundle.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
