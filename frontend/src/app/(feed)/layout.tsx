import { redirect } from "next/navigation";
import { auth } from "@/auth";
import FeedNavbar from "@/components/feed/FeedNavbar";
import RightSidebar from "@/components/feed/RightSidebar";
import { ROUTES } from "@/lib/constants";
import LeftSidebar from "@/components/feed/LeftSideBar";

export default async function FeedLayout({
                                           children,
                                         }: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) redirect(ROUTES.LOGIN);
  if (session.error === "RefreshTokenExpired") redirect(ROUTES.LOGIN);

  const { firstName, lastName } = session.user;

  return (
      <div className="_layout _layout_main_wrapper">
        <div className="_main_layout" style={{ height: "auto", overflow: "visible" }}>

          {/* ── Sticky navbar ─────────────────────────────────────────────────── */}
          <FeedNavbar firstName={firstName} lastName={lastName} />

          {/* ── 3-column layout ───────────────────────────────────────────────── */}
          <div className="_layout_inner_wrap">
            <div className="container _custom_container">
              <div className="row">

                {/* Left sidebar — col-xl-3 */}
                <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                  <LeftSidebar />
                </div>

                {/* Middle feed — col-xl-6 */}
                <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                  <div className="_layout_middle_wrap">
                    <div className="_layout_middle_inner">
                      {children}
                    </div>
                  </div>
                </div>

                {/* Right sidebar — col-xl-3 */}
                <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                  <RightSidebar />
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
  );
}
