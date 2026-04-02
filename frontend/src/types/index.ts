// ─── Auth ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
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
  imageUrl?: string;
  visibility: PostVisibility;
  likesCount: number;
  commentsCount: number;
  likedByMe: boolean;
  likedBy: Pick<User, "id" | "firstName" | "lastName" | "avatarUrl">[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostRequest {
  content: string;
  imageUrl?: string;
  visibility: PostVisibility;
}

// ─── Comments ────────────────────────────────────────────────────────────────

export interface Comment {
  id: string;
  postId: string;
  author: User;
  content: string;
  likesCount: number;
  likedByMe: boolean;
  likedBy: Pick<User, "id" | "firstName" | "lastName" | "avatarUrl">[];
  replies: Reply[];
  createdAt: string;
}

export interface Reply {
  id: string;
  commentId: string;
  author: User;
  content: string;
  likesCount: number;
  likedByMe: boolean;
  likedBy: Pick<User, "id" | "firstName" | "lastName" | "avatarUrl">[];
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
