// ─── API ─────────────────────────────────────────────────────────────────────

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export const API_ENDPOINTS = {
  // Auth
  LOGIN:         "/api/auth/login",
  REGISTER:      "/api/auth/register",
  LOGOUT:        "/api/auth/logout",
  ME:            "/api/auth/me",
  REFRESH_TOKEN: "/api/auth/refresh",

  // Posts
  POSTS:       "/api/posts",
  POST:        (id: string) => `/api/posts/${id}`,
  POST_LIKE:   (id: string) => `/api/posts/${id}/like`,
  POST_UNLIKE: (id: string) => `/api/posts/${id}/unlike`,
  POST_LIKES:  (id: string) => `/api/posts/${id}/likes`,

  // Comments
  POST_COMMENTS:  (postId:    string) => `/api/posts/${postId}/comments`,
  COMMENT_LIKE:   (id:        string) => `/api/comments/${id}/like`,
  COMMENT_UNLIKE: (id:        string) => `/api/comments/${id}/unlike`,

  // Replies
  COMMENT_REPLIES: (commentId: string) => `/api/comments/${commentId}/replies`,
  REPLY_LIKE:      (id:        string) => `/api/replies/${id}/like`,
  REPLY_UNLIKE:    (id:        string) => `/api/replies/${id}/unlike`,
} as const;

// ─── Routes ──────────────────────────────────────────────────────────────────

export const ROUTES = {
  HOME:     "/",
  LOGIN:    "/login",
  REGISTER: "/register",
  FEED:     "/feed",
} as const;

// ─── Feed ─────────────────────────────────────────────────────────────────────

export const FEED_PAGE_SIZE = 10;
