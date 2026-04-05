# Architecture & Design Decisions

## Layer Architecture

```
HTTP Request
     │
     ▼
┌─────────────────────────────────────────────┐
│             Controller Layer                │  ← Route handling, auth guards,
│  (auth, posts, comments, replies,           │    request/response mapping,
│   cloudinary controllers)                  │    DTO validation via pipes
└─────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────┐
│              Service Layer                  │  ← Business logic, cross-entity
│  (AuthService, PostsService,                │    rules, visibility enforcement,
│   CommentsService, RepliesService,          │    serialization, error throwing
│   CloudinaryService)                        │
└─────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────┐
│            Repository Layer                 │  ← All DB access, QueryBuilder,
│  (UsersRepository, PostsRepository,         │    transactions, joins
│   CommentsRepository, RepliesRepository)    │
└─────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────┐
│          PostgreSQL (TypeORM)               │  ← 7 entities, indexed columns,
│                                             │    composite PKs on like tables
└─────────────────────────────────────────────┘
```

---

## Authentication Flow

### Login
```
POST /api/auth/login
  → LocalStrategy.validate(email, password)
  → UsersService.validatePassword (bcrypt.compare)
  → AuthService.login(user)
  → JwtService.signAsync × 2 (access 15m, refresh 24h, different secrets)
  → UsersService.setRefreshTokenHash (bcrypt.hash stored in DB)
  → Returns { access_token, refresh_token, user }
```

### Protected Request
```
GET /api/posts  [Authorization: Bearer <access_token>]
  → JwtAuthGuard → JwtStrategy.validate(payload)
  → JwtStrategy loads user from DB via UsersService.findById
  → Request.user = User entity
  → PostsController.getFeed(@CurrentUser() user)
```

### Token Refresh
```
POST /api/auth/refresh  [body: { refresh_token }]
  → JwtRefreshGuard → JwtRefreshStrategy.validate(req, payload)
  → AuthService.validateRefreshToken(userId, rawToken)
  → bcrypt.compare(rawToken, storedHash)   ← hash comparison, not plaintext
  → AuthService.refresh(user)
  → New token pair generated
  → Old refresh token hash overwritten in DB (rotation)
  → Returns { access_token, refresh_token }
```

### Why store refresh token as bcrypt hash?
If the database is compromised, attackers cannot use stored hashes directly — they would need the original tokens. This is the same principle as password hashing.

---

## Database Schema

```sql
users
  id            UUID PK (auto-generated)
  first_name    VARCHAR(100)
  last_name     VARCHAR(100)
  email         VARCHAR(255) UNIQUE INDEX
  password_hash TEXT
  avatar_url    TEXT nullable
  refresh_token_hash TEXT nullable   ← nulled on logout, overwritten on refresh
  created_at    TIMESTAMPTZ
  updated_at    TIMESTAMPTZ

posts
  id             UUID PK
  user_id        UUID FK → users.id  INDEX
  content        TEXT nullable
  image_url      TEXT nullable
  visibility     ENUM('public','private') DEFAULT 'public'
  likes_count    INT DEFAULT 0          ← denormalized for O(1) read
  comments_count INT DEFAULT 0          ← denormalized for O(1) read
  created_at     TIMESTAMPTZ            INDEX DESC (feed ordering)
  updated_at     TIMESTAMPTZ

post_likes
  user_id   UUID FK → users.id
  post_id   UUID FK → posts.id
  created_at TIMESTAMPTZ
  PRIMARY KEY (user_id, post_id)        ← prevents duplicate likes at DB level

comments
  id          UUID PK
  post_id     UUID FK → posts.id  INDEX
  user_id     UUID FK → users.id
  content     TEXT
  likes_count INT DEFAULT 0
  created_at  TIMESTAMPTZ

comment_likes
  user_id    UUID FK → users.id
  comment_id UUID FK → comments.id
  created_at TIMESTAMPTZ
  PRIMARY KEY (user_id, comment_id)

replies
  id          UUID PK
  comment_id  UUID FK → comments.id  INDEX
  user_id     UUID FK → users.id
  content     TEXT
  likes_count INT DEFAULT 0
  created_at  TIMESTAMPTZ

reply_likes
  user_id  UUID FK → users.id
  reply_id UUID FK → replies.id
  created_at TIMESTAMPTZ
  PRIMARY KEY (user_id, reply_id)
```

---

## Scalability Decisions

### 1. Cursor-based Pagination (not OFFSET)
```sql
-- BAD at scale — O(n) skip cost
SELECT * FROM posts ORDER BY created_at DESC LIMIT 10 OFFSET 50000;

-- GOOD — O(log n) using index
SELECT * FROM posts
WHERE (created_at < :cursorDate OR (created_at = :cursorDate AND id < :cursorId))
  AND (visibility = 'public' OR user_id = :userId)
ORDER BY created_at DESC
LIMIT 10;
```

### 2. Denormalized Like/Comment Counters
```sql
-- BAD — full table scan on every feed load
SELECT COUNT(*) FROM post_likes WHERE post_id = $1;

-- GOOD — O(1), updated atomically in a transaction
UPDATE posts SET likes_count = likes_count + 1 WHERE id = $1;
```
TypeORM's `manager.increment()` and `manager.decrement()` are wrapped in a transaction alongside the like row insert/delete to ensure consistency.

### 3. Single JOIN for Feed
The feed query uses `createQueryBuilder` with `leftJoinAndSelect` to load post + author + liked_by_me state in one SQL query. No N+1.

### 4. Comments with Replies in One Query
`GET /api/posts/:id/comments` loads all comments AND their replies with author data in a single QueryBuilder call using chained `leftJoinAndSelect`. This avoids the classic N+1 pattern where each comment would trigger a separate query for its replies.

### 5. Indexed Columns
- `users.email` — unique index (login lookup)
- `posts.user_id` — index (user's own posts filter)
- `posts.created_at` — index DESC (feed ordering)
- `comments.post_id` — index (comments per post)
- `replies.comment_id` — index (replies per comment)
- `post_likes(user_id, post_id)` — composite unique (atomic like constraint)

---

## Security Decisions

| Concern | Implementation |
|---|---|
| Password storage | `bcrypt` with 10 salt rounds in `UsersService` — never in controller |
| Refresh token storage | `bcrypt` hash stored in `users.refresh_token_hash` — raw token never persisted |
| Refresh token rotation | Each `/auth/refresh` call overwrites the hash — old token immediately invalid |
| JWT secrets | Two separate secrets: `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` — different compromise surfaces |
| Cloudinary API secret | Never leaves the server — only derived `signature` is returned to client |
| Private post leakage | `WHERE (visibility = 'public' OR user_id = :userId)` enforced in repository — cannot be bypassed by client |
| Mass assignment | `ValidationPipe({ whitelist: true })` strips all properties not in DTO |
| Input validation | `class-validator` on every DTO — `MinLength`, `IsEmail`, `IsEnum`, `IsUrl` etc. |
| CORS | Explicit origin whitelist via `CORS_ORIGIN` env var |
| Duplicate likes | `PRIMARY KEY (user_id, post_id)` prevents duplicates at DB level + 409 at service level |

---

## Note on SSG / SSR / CSR

The question mentioned SSG, SSR, and CSR. These are **frontend rendering strategies** and do not apply to a NestJS REST API backend. The backend is a stateless HTTP server that returns JSON. Rendering strategy decisions live entirely in the Next.js frontend:

- **SSR** — Feed shell (auth guard, personalised navbar)
- **CSR** — Feed post list (SWR infinite scroll, real-time updates)
- **SSG** — Not used (all content is user-specific or real-time)

The backend serves the same JSON regardless of how the frontend renders it.

---

## Module Dependency Graph

```
AppModule
├── ConfigModule (global)
├── TypeOrmModule (global)
├── AuthModule
│   └── UsersModule ← exports UsersService
├── UsersModule
├── PostsModule ← exports PostsService
├── CommentsModule
│   └── PostsModule (for PostsService)
├── RepliesModule
│   └── CommentsModule (for CommentsService)
└── CloudinaryModule
```
