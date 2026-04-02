import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Account",
    template: "%s | Appifylab Social",
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      {children}
    </div>
  );
}
