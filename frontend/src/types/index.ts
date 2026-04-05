// ─── Auth ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  first_name?: string;
  last_name?: string;
}

export interface AuthTokenPayload {
  sub: string; // user id
  email: string;
  iat: number;
  exp: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ─── Posts ───────────────────────────────────────────────────────────────────

export type PostVisibility = "public" | "private";

export interface Post {
  id: string;
  author: User;
  content: string;
  image_url?: string;
  visibility: PostVisibility;
  likes_count: number;
  comments_count: number;
  liked_by_me: boolean;
  liked_by: Pick<User, "id" | "first_name" | "last_name" | "avatar_url">[];
  created_at: string;
  updated_at: string;
}

export interface CreatePostRequest {
  content: string;
  imageUrl?: string;
  visibility: PostVisibility;
}

// ─── Comments ────────────────────────────────────────────────────────────────

export interface Comment {
  id: string;
  post_id: string;
  author: User;
  content: string;
  likes_count: number;
  liked_by_me: boolean;
  liked_by: Pick<User, "id" | "first_name" | "last_name" | "avatar_url">[];
  replies: Reply[];
  created_at: string;
}

export interface Reply {
  id: string;
  comment_id: string;
  author: User;
  content: string;
  likesCount: number;
  likedByMe: boolean;
  likedBy: Pick<User, "id" | "first_name" | "last_name" | "avatar_url">[];
  createdAt: string;
}

export interface CreateCommentRequest {
  postId: string;
  content: string;
}

export interface CreateReplyRequest {
  commentId: string;
  content: string;
}

// ─── API generic wrapper ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

// ─── Pagination ──────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
}
