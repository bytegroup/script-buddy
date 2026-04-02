import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Appifylab Social",
    template: "%s | Appifylab Social",
  },
  description: "A social platform built with Next.js 15",
  robots: {
    index: false, // keep private until launch
    follow: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        {children}

        {/*
         * Bootstrap JS bundle (includes Popper) loaded after page hydration.
         * strategy="afterInteractive" is the default for next/script —
         * it avoids blocking the initial render.
         */}
        <Script
          src="/assets/js/bootstrap.bundle.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
