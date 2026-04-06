/**
 * RightSidebar.tsx — Dummy right sidebar matching feed.html design exactly.
 * No actions, purely presentational.
 */

// ── You Might Like ────────────────────────────────────────────────────────────
const youMightLike = [
  { name: "Radovan SkillArena", role: "Founder & CEO at Trophy",  initials: "RS", color: "#7B61FF" },
  { name: "Samantha Clarke",    role: "Head of Design at Stripe",  initials: "SC", color: "#F7941D" },
  { name: "Marcus Wei",         role: "CTO at Vercel",             initials: "MW", color: "#0ACF83" },
];

// ── Friends list ──────────────────────────────────────────────────────────────
const friends = [
  { name: "Steve Jobs",      role: "CEO of Apple",    initials: "SJ", color: "#1890FF", online: false, lastSeen: "5 min ago" },
  { name: "Ryan Roslansky",  role: "CEO of LinkedIn", initials: "RR", color: "#0ACF83", online: true,  lastSeen: null },
  { name: "Dylan Field",     role: "CEO of Figma",    initials: "DF", color: "#F7941D", online: true,  lastSeen: null },
  { name: "Sundar Pichai",   role: "CEO of Google",   initials: "SP", color: "#7B61FF", online: false, lastSeen: "2 hrs ago" },
  { name: "Satya Nadella",   role: "CEO of Microsoft",initials: "SN", color: "#FF4D4F", online: true,  lastSeen: null },
  { name: "Jensen Huang",    role: "CEO of NVIDIA",   initials: "JH", color: "#1890FF", online: false, lastSeen: "1 day ago" },
];

export default function RightSidebar() {
  return (
    <div className="_layout_right_sidebar_wrap">

      {/* ── You Might Like ───────────────────────────────────────────────────── */}
      <div className="_layout_right_sidebar_inner">
        <div className="_right_inner_area_info _padd_t24 _padd_b24 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
          <div className="_right_inner_area_info_content _mar_b24">
            <h4 className="_right_inner_area_info_content_title _title5">You Might Like</h4>
            <span className="_right_inner_area_info_content_txt">
              <a className="_right_inner_area_info_content_txt_link" href="#0">See All</a>
            </span>
          </div>
          <hr className="_underline" />

          {youMightLike.map((person) => (
            <div key={person.name} className="_right_inner_area_info_ppl">
              <div className="_right_inner_area_info_box">
                <div className="_right_inner_area_info_box_image">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold _ppl_img"
                    style={{ background: person.color, width: 44, height: 44, fontSize: 14, flexShrink: 0 }}
                  >
                    {person.initials}
                  </div>
                </div>
                <div className="_right_inner_area_info_box_txt">
                  <a href="#0">
                    <h4 className="_right_inner_area_info_box_title">{person.name}</h4>
                  </a>
                  <p className="_right_inner_area_info_box_para">{person.role}</p>
                </div>
              </div>
              <div className="_right_info_btn_grp">
                <button type="button" className="_right_info_btn_link">Ignore</button>
                <button type="button" className="_right_info_btn_link _right_info_btn_link_active">Follow</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Your Friends ────────────────────────────────────────────────────── */}
      <div className="_layout_right_sidebar_inner">
        <div className="_feed_right_inner_area_card _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">

          {/* Sticky header with search */}
          <div className="_feed_top_fixed">
            <div className="_feed_right_inner_area_card_content _mar_b24">
              <h4 className="_feed_right_inner_area_card_content_title _title5">Your Friends</h4>
              <span className="_feed_right_inner_area_card_content_txt">
                <a className="_feed_right_inner_area_card_content_txt_link" href="#0">See All</a>
              </span>
            </div>
            <form className="_feed_right_inner_area_card_form">
              <svg className="_feed_right_inner_area_card_form_svg" xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" viewBox="0 0 17 17">
                <circle cx="7" cy="7" r="6" stroke="#666"/>
                <path stroke="#666" strokeLinecap="round" d="M16 16l-3-3"/>
              </svg>
              <input
                className="form-control me-2 _feed_right_inner_area_card_form_inpt"
                type="search"
                placeholder="Search friends"
                aria-label="Search"
                readOnly
              />
            </form>
          </div>

          {/* Friends list */}
          <div className="_feed_bottom_fixed">
            {friends.map((friend) => (
              <div
                key={friend.name}
                className={`_feed_right_inner_area_card_ppl${!friend.online ? " _feed_right_inner_area_card_ppl_inactive" : ""}`}
              >
                <div className="_feed_right_inner_area_card_ppl_box">
                  <div className="_feed_right_inner_area_card_ppl_image">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold _box_ppl_img"
                      style={{ background: friend.color, width: 40, height: 40, fontSize: 13, flexShrink: 0 }}
                    >
                      {friend.initials}
                    </div>
                  </div>
                  <div className="_feed_right_inner_area_card_ppl_txt">
                    <a href="#0">
                      <h4 className="_feed_right_inner_area_card_ppl_title">{friend.name}</h4>
                    </a>
                    <p className="_feed_right_inner_area_card_ppl_para">{friend.role}</p>
                  </div>
                </div>

                {/* Online indicator or last-seen */}
                <div className="_feed_right_inner_area_card_ppl_side">
                  {friend.online ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 14 14">
                      <rect width="12" height="12" x="1" y="1" fill="#0ACF83" stroke="#fff" strokeWidth="2" rx="6"/>
                    </svg>
                  ) : (
                    <span>{friend.lastSeen}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

    </div>
  );
}
