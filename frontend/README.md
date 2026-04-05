# Appifylab Social

A full-stack social media platform built with **Next.js 16**, **Auth.js v5**, **Bootstrap**, and **Cloudinary**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.2 (App Router, Turbopack) |
| Auth | Auth.js v5 (next-auth@5 beta) — JWT + refresh tokens |
| Styling | Bootstrap 5 (local assets) + custom CSS |
| Data fetching | SWR 2 (CSR), Next.js `fetch` (SSR) |
| Image hosting | Cloudinary (direct signed upload) |
| Language | TypeScript 6 |
| Runtime | Node.js 22+ |

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Backend API (your Express/FastAPI/etc server)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001

# Auth.js v5
AUTH_SECRET=generate-with-openssl-rand-base64-32
AUTH_URL=http://localhost:3000

# Cloudinary (https://cloudinary.com/console)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

### 3. Start development server

```bash
npm run dev
# Opens http://localhost:3000
```

### 4. Run tests

```bash
npm test
# Runs: init.test.mjs + auth.test.mjs + feed.test.mjs
```

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # Login + Register (route group — no layout segment in URL)
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (feed)/              # Feed layout + pages
│   │   ├── layout.tsx       # Navbar, auth guard
│   │   └── feed/page.tsx    # SSR shell + CSR FeedClient
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts   # Auth.js v5 handler
│   │   │   └── register/route.ts       # Registration proxy
│   │   ├── posts/           # CRUD + likes + comments
│   │   ├── comments/        # Like + replies
│   │   ├── replies/         # Like
│   │   └── cloudinary/sign/ # Short-lived upload signature
│   ├── layout.tsx           # Root layout (SessionProvider)
│   └── page.tsx             # Landing page
├── auth.ts                  # Auth.js v5 config (single source of truth)
├── proxy.ts                 # Route protection (replaces middleware.ts)
├── components/
│   ├── auth/                # LoginForm, RegisterForm
│   ├── feed/                # FeedClient, PostCard, CreatePostBox, …
│   └── providers/           # SessionProvider wrapper
├── hooks/
│   ├── useFeed.ts           # SWR infinite scroll
│   ├── useComments.ts       # Lazy comment fetch
│   └── useLikers.ts         # On-demand likers
├── lib/
│   ├── auth.ts              # Server-side auth helpers
│   ├── apiClient.ts         # Axios client (CSR, injects Bearer token)
│   ├── serverFetch.ts       # Fetch wrapper (SSR, injects Bearer token)
│   └── constants.ts         # Routes, API endpoints
├── styles/
│   └── globals.css          # Font-face, Bootstrap imports, custom vars
└── types/
    ├── index.ts             # App-wide TypeScript types
    └── next-auth.d.ts       # Extended Auth.js session/JWT types
```

---

## Features

### Authentication
- **JWT sessions** via Auth.js v5 (Credentials provider)
- **Access token**: 15-minute validity
- **Refresh token**: 24-hour validity, silently rotated in `jwt()` callback
- **Route protection**: `proxy.ts` (Next.js 16, replaces `middleware.ts`)
- Redirects: logged-in users → `/feed`, unauthenticated → `/login?next=…`

### Feed
- **Create posts**: text and/or image, public or private
- **Visibility**: Private posts visible only to the author
- **Newest first**: cursor-based pagination (scalable to millions of posts)
- **Infinite scroll**: `IntersectionObserver` sentinel, no layout shift
- **Optimistic UI**: likes update instantly, rollback on error

### Interactions
- **Like/unlike**: posts, comments, replies — all with optimistic updates
- **Who liked**: on-demand modal (fetched only when opened)
- **Comments**: text only, lazy-loaded when comment section opened
- **Replies**: text only, nested one level under comments

### Image Upload (Cloudinary)
1. Client requests a signed upload config from `/api/cloudinary/sign`
2. Server generates a `sha256` signature using `CLOUDINARY_API_SECRET` (never exposed)
3. Client uploads directly to Cloudinary via XHR (for progress tracking)
4. Progress bar shows real-time upload percentage
5. Cloudinary returns the `secure_url`
6. URL is saved with the post to your backend

### Security
- `AUTH_SECRET` and `CLOUDINARY_API_SECRET` are server-only env vars
- All API routes require a valid Auth.js session
- `proxy.ts` runs on every request to enforce auth
- HTTP security headers on all responses (X-Frame-Options, CSP-ready)
- Password never stored; backend handles hashing

---

## Backend API Contract

The frontend proxies all requests through Next.js API routes which inject the Bearer token automatically.

### Expected endpoints on `http://localhost:3001`

| Method | Path | Body |
|---|---|---|
| POST | `/api/auth/login` | `{ email, password }` |
| POST | `/api/auth/register` | `{ first_name, last_name, email, password }` |
| POST | `/api/auth/refresh` | `{ refresh_token }` |
| GET | `/api/posts` | query: `?cursor=&limit=` |
| POST | `/api/posts` | `{ content, image_url, visibility, user_id }` |
| POST | `/api/posts/:id/like` | `{ user_id }` |
| DELETE | `/api/posts/:id/like` | `{ user_id }` |
| GET | `/api/posts/:id/likes` | — |
| GET | `/api/posts/:id/comments` | — |
| POST | `/api/posts/:id/comments` | `{ content, user_id }` |
| POST | `/api/comments/:id/like` | `{ user_id }` |
| DELETE | `/api/comments/:id/like` | `{ user_id }` |
| GET | `/api/comments/:id/likes` | — |
| POST | `/api/comments/:id/replies` | `{ content, user_id }` |
| POST | `/api/replies/:id/like` | `{ user_id }` |
| DELETE | `/api/replies/:id/like` | `{ user_id }` |
| GET | `/api/replies/:id/likes` | — |

### Expected response shapes

```json
{
  "data": [{ "id": "...", "content": "...", "visibility": "public" }],
  "total": 100,
  "hasNextPage": true
}
```

```json


{
  "access_token": "eyJ...",
  "refresh_token": "abc...",
  "user": { "id": "1", "first_name": "Test", "last_name": "User", "email": "test@tst.com" }
}
```

---

## Deployment Checklist

- [ ] Set `AUTH_SECRET` to a cryptographically random 32+ char string
- [ ] Set `AUTH_URL` to your production domain
- [ ] Set all `CLOUDINARY_*` vars
- [ ] Set `NEXT_PUBLIC_API_BASE_URL` to your production backend
- [ ] Ensure backend whitelists your frontend domain for CORS

```bash
npm run build
npm start
```
