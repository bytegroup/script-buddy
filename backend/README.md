# Appifylab Social — NestJS Backend

A production-ready REST API built with **NestJS 11**, **Passport.js**, **PostgreSQL**, **TypeORM**, and **Swagger**.

---

## Quick Start

### Prerequisites
- Node.js 22+
- PostgreSQL 15+

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials and secrets
```

### 3. Create the database
```sql
CREATE DATABASE appifylab_social;
```

### 4. Start development server
```bash
npm run start:dev
# API:     http://localhost:3001/api
# Swagger: http://localhost:3001/api/docs
```

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `3001` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USERNAME` | DB user | `postgres` |
| `DB_PASSWORD` | DB password | — |
| `DB_NAME` | DB name | `appifylab_social` |
| `DB_SYNC` | Auto-sync schema (**dev only**) | `false` |
| `JWT_ACCESS_SECRET` | Access token secret (32+ chars) | — |
| `JWT_REFRESH_SECRET` | Refresh token secret (32+ chars) | — |
| `JWT_ACCESS_EXPIRES_IN` | Access token TTL | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL | `24h` |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:3000` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | — |
| `CLOUDINARY_API_KEY` | Cloudinary API key | — |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret (**server-only**) | — |
| `CLOUDINARY_UPLOAD_FOLDER` | Upload folder in Cloudinary | `appifylab-social/posts` |

---

## Project Structure

```
src/
├── main.ts                        # Bootstrap: Swagger, CORS, pipes, filters
├── app.module.ts                  # Root module: TypeORM, Config, feature modules
│
├── auth/                          # Authentication & Authorization
│   ├── strategies/
│   │   ├── local.strategy.ts      # Passport-local (email/password)
│   │   ├── jwt.strategy.ts        # Passport-jwt (access token)
│   │   └── jwt-refresh.strategy.ts # Passport-jwt (refresh token)
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   ├── local-auth.guard.ts
│   │   └── jwt-refresh.guard.ts
│   ├── decorators/
│   │   └── current-user.decorator.ts
│   ├── dto/
│   │   ├── register.dto.ts
│   │   ├── login.dto.ts
│   │   ├── refresh-token.dto.ts
│   │   └── auth-response.dto.ts
│   ├── auth.service.ts            # Token generation, refresh rotation, logout
│   ├── auth.controller.ts         # /auth/* endpoints
│   └── auth.module.ts
│
├── users/                         # User management
│   ├── entities/user.entity.ts
│   ├── dto/user-response.dto.ts
│   ├── users.repository.ts        # DB access layer
│   ├── users.service.ts           # Business logic + bcrypt
│   └── users.module.ts
│
├── posts/                         # Posts CRUD + likes + feed
│   ├── entities/
│   │   ├── post.entity.ts
│   │   └── post-like.entity.ts
│   ├── dto/
│   │   ├── create-post.dto.ts
│   │   └── post-query.dto.ts
│   ├── posts.repository.ts        # Cursor pagination, atomic likes
│   ├── posts.service.ts           # Visibility enforcement, serialization
│   ├── posts.controller.ts
│   └── posts.module.ts
│
├── comments/                      # Comments + likes
│   ├── entities/
│   │   ├── comment.entity.ts
│   │   └── comment-like.entity.ts
│   ├── dto/create-comment.dto.ts
│   ├── comments.repository.ts
│   ├── comments.service.ts
│   ├── comments.controller.ts
│   └── comments.module.ts
│
├── replies/                       # Replies + likes
│   ├── entities/
│   │   ├── reply.entity.ts
│   │   └── reply-like.entity.ts
│   ├── dto/create-reply.dto.ts
│   ├── replies.repository.ts
│   ├── replies.service.ts
│   ├── replies.controller.ts
│   └── replies.module.ts
│
├── cloudinary/                    # Signed upload config
│   ├── cloudinary.service.ts
│   ├── cloudinary.controller.ts
│   └── cloudinary.module.ts
│
└── common/
    ├── decorators/current-user.decorator.ts
    ├── filters/http-exception.filter.ts    # Unified error shape
    └── interceptors/transform.interceptor.ts # Wraps all responses in { data, statusCode, timestamp }
```

---

## API Reference

All endpoints are documented at **http://localhost:3001/api/docs** (Swagger UI).

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ❌ | Register |
| POST | `/api/auth/login` | ❌ | Login → tokens |
| POST | `/api/auth/refresh` | ❌ (refresh token) | Rotate tokens |
| POST | `/api/auth/logout` | ✅ | Invalidate refresh token |
| GET | `/api/auth/me` | ✅ | Current user profile |

### Posts
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/posts` | ✅ | Paginated feed |
| POST | `/api/posts` | ✅ | Create post |
| POST | `/api/posts/:id/like` | ✅ | Like |
| DELETE | `/api/posts/:id/like` | ✅ | Unlike |
| GET | `/api/posts/:id/likes` | ✅ | Who liked |
| GET | `/api/posts/:id/comments` | ✅ | Comments + replies |
| POST | `/api/posts/:id/comments` | ✅ | Add comment |

### Comments
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/comments/:id/like` | ✅ | Like |
| DELETE | `/api/comments/:id/like` | ✅ | Unlike |
| GET | `/api/comments/:id/likes` | ✅ | Who liked |
| POST | `/api/comments/:id/replies` | ✅ | Add reply |

### Replies
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/replies/:id/like` | ✅ | Like |
| DELETE | `/api/replies/:id/like` | ✅ | Unlike |
| GET | `/api/replies/:id/likes` | ✅ | Who liked |

### Cloudinary
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/cloudinary/sign` | ✅ | Get signed upload config |

---

## Deployment Checklist

- [ ] Set `DB_SYNC=false` and run migrations instead
- [ ] Use strong random secrets for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`  
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- [ ] Set `CORS_ORIGIN` to your production frontend domain
- [ ] Set all `CLOUDINARY_*` variables
- [ ] Enable SSL on PostgreSQL connection

```bash
npm run build
npm run start:prod
```
