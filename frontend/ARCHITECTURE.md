# Architecture & Design Decisions

## Rendering Strategy Matrix

| Route | Strategy | Why |
|---|---|---|
| `/` (home) | SSR | Reads session to show Login vs Go-to-Feed CTA |
| `/login` | SSR | Auth guard: redirect to `/feed` if already logged in |
| `/register` | SSR | Auth guard: redirect to `/feed` if already logged in |
| `/feed` (shell) | SSR + `force-dynamic` | Auth guard, session data for navbar |
| Feed posts list | **CSR (SWR)** | Real-time, personalized, infinite scroll |
| Comments (per post) | **CSR (SWR, lazy)** | Loaded only when user opens comment section |
| Likers modal | **CSR (SWR, lazy)** | Fetched only when user clicks "N likes" |
| `/api/*` (all) | SSR (API Routes) | Server-side auth injection, secret protection |

### Why CSR for the feed content?

Feed data is:
1. **Personalized** — private posts filtered per user
2. **Real-time** — new posts appear without page reload
3. **Infinite** — cursor-based pagination requires browser state
4. **Mutable** — optimistic updates for likes change local state instantly

Static generation (SSG/ISR) is inappropriate because content changes per-user and per-second.

---

## Auth Architecture

```
Browser                  Next.js (proxy.ts)           Auth.js (src/auth.ts)
   │                           │                               │
   │── GET /feed ─────────────>│                               │
   │                           │── auth() ─────────────────────>
   │                           │<── session or null ────────────
   │                           │
   │  (no session) ────────────│── redirect /login?next=/feed ──>
   │  (session ok) ────────────│── NextResponse.next() ──────────>
```

### JWT Refresh Flow

```
Client                Next.js API          Backend
  │                       │                   │
  │── request ───────────>│                   │
  │                       │ jwt() callback checks token.accessTokenExpiresAt
  │                       │ (expired) ───── POST /api/auth/refresh ──────────>
  │                       │                   │── { access_token, refresh_token }
  │                       │<─────────────────────────────────────────────────
  │                       │ updates encrypted cookie transparently
  │<── response ──────────│
```

Token lifetimes:
- **Access token**: 15 minutes (`ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000`)
- **Refresh token**: 24 hours (`REFRESH_TOKEN_TTL_MS = 24 * 60 * 60 * 1000`)
- **Session cookie**: matches refresh token lifetime

---

## Cloudinary Direct Upload Flow

```
Browser                  Next.js API                    Cloudinary
   │                    /api/cloudinary/sign                 │
   │                           │                             │
   │── POST /sign ────────────>│                             │
   │                           │ generates sha256 signature  │
   │                           │ using CLOUDINARY_API_SECRET │
   │<── { timestamp, sig, key} │  (secret NEVER leaves here) │
   │                           │                             │
   │── XHR upload ─────────────────────────────────────────>│
   │   (with progress events)  │                             │
   │<── { secure_url } ──────────────────────────────────────
   │                           │                             │
   │── POST /api/posts ───────>│  save secure_url to backend │
```

Why XHR instead of `fetch`?
- `fetch` does not expose upload progress events
- `XMLHttpRequest.upload.onprogress` is the only browser API for real-time progress
- The progress bar is driven by `e.loaded / e.total`

---

## Database Design (Backend Contract)

Designed for millions of posts and reads:

```
users
  id (uuid)
  first_name, last_name, email, password_hash
  avatar_url, created_at

posts
  id (uuid)
  user_id → users.id
  content (text)
  image_url (nullable)
  visibility ENUM('public', 'private')
  created_at  ← indexed DESC for feed ordering

post_likes
  user_id, post_id  ← composite PK
  created_at

comments
  id (uuid)
  post_id → posts.id
  user_id → users.id
  content
  created_at

comment_likes
  user_id, comment_id  ← composite PK

replies
  id (uuid)
  comment_id → comments.id
  user_id → users.id
  content
  created_at

reply_likes
  user_id, reply_id  ← composite PK
```

### Scalability for Millions of Posts

1. **Cursor pagination** — `WHERE id < :cursor ORDER BY id DESC LIMIT 10`
   - O(1) regardless of total post count; offset pagination degrades at scale

2. **Private post filtering** — done at the SQL layer:
   ```sql
   WHERE (visibility = 'public' OR user_id = :current_user_id)
   ```

3. **Like counts** — denormalized counter column on posts/comments/replies
   - Updated atomically with `UPDATE posts SET likes_count = likes_count + 1`
   - Avoids expensive `COUNT(*)` on large like tables

4. **Comment lazy loading** — comments fetched per-post only when opened
   - Prevents N+1 queries on the feed

5. **Likers on-demand** — full liker list fetched only when user opens modal
   - Feed payload stays lean even for viral posts with millions of likes

---

## Component Architecture

```
FeedPage (SSR)
├── FeedNavbar (CSR — uses session from SessionProvider)
└── FeedClient (CSR)
    ├── CreatePostBox (CSR)
    │   └── ImageUpload (CSR — XHR progress)
    └── PostCard[] (CSR — optimistic mutations)
        ├── LikersModal (CSR — lazy fetch)
        └── CommentItem[] (CSR — SWR lazy)
            └── ReplyItem[] (CSR)
```

### State Management

No global state library needed. State is co-located:
- **SWR cache** — acts as a lightweight server-state store
- **`mutateFeed()`** — used for optimistic like updates across the feed
- **Component-local `useState`** — for UI toggles (showComments, showLikers, etc.)

---

## Security Checklist

| Concern | Mitigation |
|---|---|
| JWT secret exposure | `AUTH_SECRET` server-only env var |
| Cloudinary API secret exposure | Stays in `/api/cloudinary/sign` — never in client bundles |
| CSRF | Auth.js v5 handles CSRF tokens internally |
| Unauthenticated API access | All `/api/*` routes call `await auth()` and return 401 |
| Private post leakage | SQL `WHERE` clause filters on backend; frontend also checks `visibility` |
| XSS | React escapes all interpolated values by default |
| Clickjacking | `X-Frame-Options: DENY` header on all responses |
| Open redirect | `proxy.ts` only redirects to relative paths |

---

## Changed Files Summary

### New in this step

| File | Change |
|---|---|
| `package.json` | Added `swr@2.3.3` |
| `next.config.mjs` | Added `res.cloudinary.com` to `remotePatterns` |
| `.env.local` / `.env.example` | Added 4 Cloudinary env vars |
| `src/lib/serverFetch.ts` | New — SSR fetch with auto auth injection |
| `src/lib/apiClient.ts` | Updated — uses `getSession()` for token |
| `src/lib/constants.ts` | Added `REFRESH_TOKEN` endpoint |
| `src/app/api/posts/*` | New — posts CRUD, likes, comments |
| `src/app/api/comments/*` | New — comment likes, replies |
| `src/app/api/replies/*` | New — reply likes |
| `src/app/api/cloudinary/sign/route.ts` | New — Cloudinary signature |
| `src/hooks/useFeed.ts` | New — SWR infinite scroll |
| `src/hooks/useComments.ts` | New — lazy comments |
| `src/hooks/useLikers.ts` | New — on-demand likers |
| `src/components/feed/*.tsx` | New — all feed components |
| `src/app/(feed)/layout.tsx` | New — feed layout with navbar |
| `src/app/(feed)/feed/page.tsx` | Replaced — SSR shell + CSR pattern |
| `tests/feed.test.mjs` | New — 65+ assertions |
| `README.md` | New — setup guide |
| `ARCHITECTURE.md` | New — this file |
