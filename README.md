# FeedbackBoard — Customer Feedback Portal

> Built with **[Stakpak](https://github.com/stakpak/agent)** — an open source agent that lives on your machines 24/7, keeps your apps running, and only pings when it needs a human. .

A simple full-stack feedback board built with **Next.js 16 (App Router)**, **TypeScript**, **Supabase**, **PostgreSQL**, and **Tailwind CSS**.

Users can submit feature requests, report bugs, vote on posts, attach images, and track status through a simple dashboard.

---

## Features

- **Homepage** — List all feedback posts, sorted by votes
- **Create Post** — Submit feedback with category, description, and an optional image upload
- **Image Upload** — Attach screenshots or mockups (stored locally under `public/uploads/`)
- **Search & Filter** — Filter by keyword, category, and status
- **Post Detail** — View full post with comments
- **Dashboard** — Stats overview: total posts, votes, category breakdown, top & recent posts
- **API Routes** — REST endpoints for posts, votes, comments, uploads, and stats

---

## Tech Stack

| Layer       | Technology                   |
|-------------|------------------------------|
| Framework   | Next.js 16 (App Router)      |
| Language    | TypeScript                   |
| Styling     | Tailwind CSS v4              |
| Database    | Supabase (PostgreSQL)        |
| DB Client   | Supabase JS                  |
| File Upload | Local filesystem (`public/uploads/`) |

---

## Prerequisites

- **Node.js** >= 18
- **PostgreSQL** running locally (or via Docker)
- **npm** >= 9

---

## Local Setup

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd feedbackboard
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and set your database connection string:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/feedbackboard?schema=public"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Start PostgreSQL (Docker option)

```bash
docker run --name feedbackboard-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=feedbackboard \
  -p 5432:5432 \
  -d postgres:16
```

### 4. Run database migrations

```bash
npm run db:migrate
# when prompted, name the migration: init
```

Or if you just want to push the schema without a migration history:

```bash
npm run db:push
```

### 5. Seed the database

Populates the DB with 15 sample feedback posts:

```bash
npm run db:seed
```

### 6. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

| Script           | Description                                   |
|------------------|-----------------------------------------------|
| `npm run dev`    | Start Next.js development server              |
| `npm run build`  | Production build                              |
| `npm run start`  | Start production server                       |
| `npm run lint`   | Run ESLint                                    |
| `npm run db:migrate` | Run Prisma migrations (dev)               |
| `npm run db:push` | Push schema to DB without migration history  |
| `npm run db:seed` | Seed database with sample posts             |
| `npm run db:generate` | Regenerate Prisma client                |
| `npm run db:studio` | Open Prisma Studio (GUI)                  |

---

## API Endpoints

| Method | Endpoint                        | Description                   |
|--------|---------------------------------|-------------------------------|
| GET    | `/api/posts`                    | List posts (search/filter)    |
| POST   | `/api/posts`                    | Create a new post             |
| POST   | `/api/posts/:id/vote`           | Upvote a post                 |
| GET    | `/api/posts/:id/comments`       | List comments on a post       |
| POST   | `/api/posts/:id/comments`       | Add a comment                 |
| POST   | `/api/upload`                   | Upload an image               |
| GET    | `/api/stats`                    | Get dashboard statistics      |

---

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── posts/
│   │   │   ├── route.ts              # GET list, POST create
│   │   │   └── [id]/
│   │   │       ├── vote/route.ts     # POST upvote
│   │   │       └── comments/route.ts # GET/POST comments
│   │   ├── upload/route.ts           # POST image upload
│   │   └── stats/route.ts            # GET dashboard stats
│   ├── dashboard/page.tsx            # Stats dashboard (ISR, 30s)
│   ├── new/page.tsx                  # New post form
│   ├── posts/[id]/page.tsx           # Post detail + comments
│   ├── layout.tsx                    # Root layout with Navbar
│   └── page.tsx                      # Home — post list (ISR, 60s)
├── components/
│   ├── CommentSection.tsx
│   ├── Navbar.tsx
│   ├── NewPostForm.tsx
│   ├── PostCard.tsx
│   └── SearchFilter.tsx
├── lib/
│   ├── constants.ts                  # Labels, colors
│   ├── prisma.ts                     # Prisma singleton
│   └── uploads.ts                    # Local file upload helper
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
│   └── uploads/                      # Uploaded images (gitignored)
├── .env
├── .env.example
└── next.config.ts
```

---

## License

MIT
