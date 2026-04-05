"use client";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { ROUTES } from "@/lib/constants";

interface Props {
  firstName: string;
  lastName:  string;
}

export default function FeedNavbar({ firstName, lastName }: Props) {
  const initials = `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <nav className="navbar navbar-expand-lg navbar-light _header_nav _padd_t10"
         style={{ background: "var(--bg2,#fff)", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", position: "sticky", top: 0, zIndex: 100 }}>
      <div className="container _custom_container">

        {/* Logo */}
        <Link className="navbar-brand _logo_wrap" href={ROUTES.FEED}>
          <Image src="/assets/images/logo.svg" alt="Logo" width={120} height={36} className="_nav_logo" />
        </Link>

        <button className="navbar-toggler bg-light" type="button"
                data-bs-toggle="collapse" data-bs-target="#feedNav"
                aria-controls="feedNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="feedNav">
          {/* Search */}
          <div className="_header_form ms-auto me-3">
            <form className="_header_form_grp d-flex align-items-center gap-1">
              <svg className="_header_form_svg" xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" viewBox="0 0 17 17">
                <circle cx="7" cy="7" r="6" stroke="#666"/>
                <path stroke="#666" strokeLinecap="round" d="M16 16l-3-3"/>
              </svg>
              <input className="form-control me-2 _inpt1" type="search" placeholder="Search…" aria-label="Search" />
            </form>
          </div>

          {/* Nav icons */}
          <ul className="navbar-nav mb-2 mb-lg-0 _header_nav_list _mar_r8 d-flex align-items-center gap-2">
            {/* Home */}
            <li className="nav-item _header_nav_item">
              <Link className="nav-link _header_nav_link_active _header_nav_link" href={ROUTES.FEED}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="21" fill="none" viewBox="0 0 18 21">
                  <path className="_home_active" stroke="#000" strokeWidth="1.5" strokeOpacity=".6"
                        d="M1 9.924c0-1.552 0-2.328.314-3.01.313-.682.902-1.187 2.08-2.196l1.143-.98C6.667 1.913 7.732 1 9 1c1.268 0 2.333.913 4.463 2.738l1.142.98c1.179 1.01 1.768 1.514 2.081 2.196.314.682.314 1.458.314 3.01v4.846c0 2.155 0 3.233-.67 3.902-.669.67-1.746.67-3.901.67H5.57c-2.155 0-3.232 0-3.902-.67C1 18.002 1 16.925 1 14.77V9.924z"/>
                </svg>
              </Link>
            </li>

            {/* User avatar + signout dropdown */}
            <li className="nav-item _header_nav_item position-relative" style={{ listStyle: "none" }}>
              <div className="dropdown">
                <button
                  className="btn p-0 border-0 rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                  style={{ width: 36, height: 36, background: "var(--color5,#1890ff)", fontSize: 13 }}
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {initials}
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <span className="dropdown-item-text fw-semibold small">
                      {firstName} {lastName}
                    </span>
                  </li>
                  <li><hr className="dropdown-divider my-1" /></li>
                  <li>
                    <button
                      className="dropdown-item text-danger small"
                      onClick={() => signOut({ callbackUrl: ROUTES.LOGIN })}
                    >
                      Sign out
                    </button>
                  </li>
                </ul>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
