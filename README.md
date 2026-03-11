# Calendar App

Full-stack calendar application with task management, drag-and-drop reordering, public holidays, and
theme switching.

## Live Demo

- **App:** [calendar-frontend-umber.vercel.app](https://calendar-frontend-umber.vercel.app/)
- **API Docs (Swagger):**
  [calendar-backend-tau-three.vercel.app/api-docs](https://calendar-backend-tau-three.vercel.app/api-docs)

## Tech Stack

| Layer        | Technologies                                                               |
| ------------ | -------------------------------------------------------------------------- |
| Frontend     | React 19, Vite 7, TypeScript, Emotion (CSS-in-JS), Redux Toolkit, @dnd-kit |
| Backend      | Node.js, Express, TypeScript, Prisma 7, Zod 4                              |
| Database     | PostgreSQL (Neon serverless)                                               |
| Code Quality | ESLint, Prettier, Husky + lint-staged                                      |
| CI/CD        | GitHub Actions, Vercel                                                     |

## Features

- **Calendar grid** — built manually with `Date` API (no calendar libraries)
- **Task CRUD** — create, edit, delete tasks via modals
- **Drag & drop** — reorder tasks within a day or move across days (@dnd-kit), order persisted to DB
- **Public holidays** — fetched from Nager Date API, displayed as fixed badges
- **Global search** — debounced search across all tasks with pagination
- **Priority levels** — LOW, MEDIUM, HIGH, URGENT with colored badges
- **Color labels** — multiple colored bars per task (6-color palette)
- **Light / Dark theme** — toggle with localStorage persistence
- **Country selector** — switch holiday country dynamically
- **Swagger API docs** — interactive documentation at `/api-docs`

## Security Notes

- `helmet` is enabled for baseline HTTP security headers.
- `express.json` uses a request size limit (`100kb`).
- CORS allowlist is configured via `CORS_ORIGIN` (comma-separated origins).
- Write endpoints are protected with rate limiting.
- `app.set('trust proxy', 1)` is enabled for correct client IP handling behind Vercel proxy.

## Project Structure

```
calendar-test-task/
├── frontend/          # React + Vite + Redux Toolkit
│   └── src/
│       ├── components/   # Calendar, DayCell, TaskCard, Modals
│       ├── store/        # Redux slices (tasks, calendar, search)
│       ├── hooks/        # useHolidays, useCalendar, useCountries
│       ├── services/     # Axios API clients
│       └── styles/       # Emotion theme + GlobalStyles
├── backend/           # Express + Prisma
│   ├── src/
│   │   ├── routes/       # REST API endpoints
│   │   ├── controllers/  # Business logic
│   │   ├── middleware/   # CORS, error handler, validation
│   │   ├── schemas/      # Zod validation schemas
│   │   └── lib/          # Prisma client singleton
│   ├── prisma/           # Schema, migrations, seed
│   └── api/              # Vercel serverless entry point
└── shared/            # TypeScript types shared between apps
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL database (local or [Neon](https://neon.tech) free tier)

### Installation

```bash
git clone https://github.com/solovev-dev/calendar-test-task.git
cd calendar-test-task
npm install
```

### Environment Setup

Copy root `.env.example` to backend `.env`:

```bash
cp backend/.env.example backend/.env
```

Set your `DATABASE_URL` in `backend/.env`:

```env
DATABASE_URL=postgresql://user:password@host:5432/calendar
CORS_ORIGIN=http://localhost:5173,https://calendar-frontend-umber.vercel.app
PORT=3001
```

Create `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:3001
```

### Database Setup

```bash
cd backend
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

### Run Development Server

Start backend and frontend in separate terminals:

```bash
# Terminal 1 — backend (:3001)
cd backend
npm run dev

# Terminal 2 — frontend (:5173)
cd frontend
npm run dev
```

## Available Scripts

| Command             | Description                       |
| ------------------- | --------------------------------- |
| `npm run build`     | Build both apps                   |
| `npm run lint`      | ESLint across all workspaces      |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) |

### Prisma Commands (from `backend/`)

| Command                  | Description              |
| ------------------------ | ------------------------ |
| `npx prisma migrate dev` | Run database migrations  |
| `npx prisma db seed`     | Seed guest user          |
| `npx prisma studio`      | Open database browser UI |
| `npx prisma generate`    | Regenerate Prisma client |

## API Endpoints

| Method | Endpoint               | Description                 |
| ------ | ---------------------- | --------------------------- |
| GET    | `/tasks?month=YYYY-MM` | Get tasks for a month       |
| POST   | `/tasks`               | Create a task               |
| PATCH  | `/tasks/:id`           | Update a task               |
| DELETE | `/tasks/:id`           | Delete a task               |
| PUT    | `/tasks/reorder`       | Reorder tasks (drag & drop) |

## Development Process

Task tracking and progress managed via
[GitHub Projects board](https://github.com/users/LesiaUKR/projects/1).
