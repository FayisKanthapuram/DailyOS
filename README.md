# DailyOS 🎯

DailyOS is a modern, privacy-focused task and recurring habit planner. 
It combines one-off task management, recurring daily/weekly/monthly habits, and visual calendar planning into a single unified workspace.

## Tech Stack 🛠

- **Frontend:** React 19, Vite, TailwindCSS v4, Zustand, React Query, Framer Motion
- **Backend:** NestJS 11, Prisma, PostgreSQL
- **Authentication:** JWT (HttpOnly refresh cookies) + Google OAuth
- **Architecture:** SPA with post-build static pre-rendering for SEO pages

## Features ✨

- **Unified Task Engine:** Manage one-off tasks and recurring habits side-by-side.
- **Smart Recurring Logic:** Support for Daily, Weekly, and Monthly frequencies with accurate timezone handling and historical data protection.
- **Calendar Planning:** Visual Month, Week, and Day views.
- **Progress Tracking:** Completion rates and streak statistics.
- **Secure:** Bcrypt password hashing, rotated HttpOnly refresh tokens.
- **PWA Ready:** Installable on mobile devices with an optimized bottom-navigation layout.
- **SEO Optimized:** Public pages (`/`, `/privacy`, `/terms`) are statically pre-rendered at build time with full metadata for social crawlers.

## Local Development 🚀

### 1. Prerequisites
- Node.js >= 22
- PostgreSQL database
- Docker & Docker Compose (optional, for running local DB)

### 2. Environment Setup

**Backend (`backend/.env`):**
```env
DATABASE_URL=postgresql://dailyos:dailyos@127.0.0.1:5433/dailyos
JWT_SECRET=your_local_secret_min_16_chars
JWT_REFRESH_SECRET=your_local_refresh_min_16_chars
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Frontend (`frontend/.env.local`):**
```env
VITE_SITE_URL=http://localhost:5173
```

### 3. Start PostgreSQL
```bash
docker-compose up -d
```

### 4. Setup Backend
```bash
cd backend
npm install
npx prisma migrate dev
npm run start:dev
```

### 5. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

## Production Deployment 🌐

DailyOS is designed to be easily deployed to modern cloud providers (e.g., Vercel for frontend, Render/Railway for backend).

### Backend Requirements
- Must set `NODE_ENV=production`.
- Must set long, secure `JWT_SECRET` and `JWT_REFRESH_SECRET`.
- Swagger documentation is automatically disabled in production.
- Use `CORS_ORIGIN=https://yourdomain.com` for strict CORS checking.

### Frontend Requirements
- Must set `VITE_SITE_URL=https://yourdomain.com` during the build step.
- The build will automatically run the `postbuild` script, generating:
  - Statically pre-rendered `dist/index.html`, `dist/privacy/index.html`, and `dist/terms/index.html`.
  - `dist/sitemap.xml`
  - `dist/robots.txt`

Build command:
```bash
npm run build
```

## Security & Privacy 🔒

- **Data Ownership:** User data (tasks, habits) is completely private.
- **No Analytics Bloat:** Pluggable analytics abstraction (`VITE_ANALYTICS_PROVIDER`), defaulting to no-op. If enabled, it only tracks generic product interactions, never personal data.
- **No Third-Party Trackers:** No advertising scripts or invasive trackers.

## License 📄
UNLICENSED
