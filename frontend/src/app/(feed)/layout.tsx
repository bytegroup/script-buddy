/**
 * Feed route group layout — Server Component
 *
 * Rendering strategy: SSR (per-request)
 * Why: Layout contains the navbar with user-specific data (name, avatar).
 *      It must be personalised and cannot be statically generated.
 *
 * Protects all routes under (feed)/ at the layout level as a
 * belt-and-suspenders guard (proxy.ts also handles this at the edge).
 */
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import FeedNavbar from "@/components/feed/FeedNavbar";
import { ROUTES } from "@/lib/constants";
import LeftSideBar from "@/components/feed/LeftSideBar";

export default async function FeedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) redirect(ROUTES.LOGIN);
  if (session.error === "RefreshTokenExpired") redirect(ROUTES.LOGIN);

  const { firstName, lastName } = session.user;

  return (
    <div className="_layout _layout_main_wrapper" style={{ minHeight: "100vh", background: "var(--bg1,#f0f2f5)" }}>
      <div className="_main_layout" style={{height: "auto", overflow: "visible"}}>
        <FeedNavbar firstName={firstName} lastName={lastName}/>
        <main>
          {children}
        </main>
      </div>
    </div>
  );
}
