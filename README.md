<div align="center">

# AI Knowledge Workspace

**A full-stack knowledge management app with AI, real-time collaboration, and a block-based editor.**

[![Vue 3](https://img.shields.io/badge/Vue-3.4-4FC08D?style=flat-square&logo=vue.js)](https://vuejs.org)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-5.10-2D3748?style=flat-square&logo=prisma)](https://prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql)](https://postgresql.org)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7-010101?style=flat-square&logo=socket.io)](https://socket.io)

[Features](#features) · [Stack](#stack) · [Getting Started](#getting-started) · [API](#api) · [Deploy](#deploy)

</div>

---

## Features

- **Block editor** — Text, headings (H1-H3), code with syntax highlight, checklist, bullet/numbered lists, quote, callout, image upload, divider
- **AI integration** — Summarize, improve, fix grammar, change tone, generate content, suggest tags (Gemini Flash — free tier)
- **Real-time collaboration** — WebSockets via Socket.IO: live presence avatars, cursor tracking, instant sync
- **Smart search** — `Ctrl+K` full-text search across page titles and block content
- **Version history** — Automatic snapshots on every save with one-click restore
- **Export Markdown** — Download any page as a well-formatted `.md` file with frontmatter
- **Dark/Light mode** — Persisted theme with OS preference detection
- **Monorepo** — Frontend and backend in one repo with npm workspaces

---

## 🛠 Stack

| Layer        | Technology                                       |
| ------------ | ------------------------------------------------ |
| **Frontend** | Vue 3 + Vite + TypeScript + Pinia + Tailwind CSS |
| **Backend**  | Node.js + Express + TypeScript                   |
| **ORM**      | Prisma ORM                                       |
| **Database** | PostgreSQL                                       |
| **AI**       | Google Gemini 2.5 Flash (free tier)              |
| **Realtime** | Socket.IO (WebSockets)                           |
| **Auth**     | JWT + bcrypt                                     |
| **Tests**    | Vitest + Supertest                               |
| **Infra**    | Docker + Docker Compose                          |

---

## Getting Started

### Prerequisites

- Node.js 20+
- Docker + Docker Compose
- A free [Gemini API key](https://aistudio.google.com/apikey)

### 1. Clone

```bash
git clone https://github.com/yourusername/ai-knowledge-workspace.git
cd ai-knowledge-workspace
npm install
```

### 2. Configure environment

```bash
cp apps/backend/.env.example apps/backend/.env
```

Edit `apps/backend/.env`:

```env
DATABASE_URL="postgresql://workspace:workspace123@localhost:5432/ai_workspace"
JWT_SECRET="change-this-to-a-long-random-string"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
GEMINI_API_KEY="your-key-from-aistudio.google.com"
```

### 3. Start database

```bash
npm run docker:up
```

### 4. Run migrations and seed

```bash
npm run db:migrate
npm run db:seed
```

### 5. Start dev servers

```bash
npm run dev
```

| Service   | URL                   |
| --------- | --------------------- |
| Frontend  | http://localhost:5173 |
| Backend   | http://localhost:3000 |
| DB Studio | `npm run db:studio`   |

### Demo credentials

```
Email:    demo@workspace.dev
Password: demo123
```

---

## Tests

```bash
# Backend tests (integration with real DB)
cd apps/backend
npm test

# Frontend tests (unit)
cd apps/frontend
npm test

# Coverage report
npm run test:coverage
```

---

## API Reference

### Auth

| Method | Endpoint             | Description    |
| ------ | -------------------- | -------------- |
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/login`    | Sign in → JWT  |
| `GET`  | `/api/auth/me`       | Current user   |

### Pages

| Method   | Endpoint                  | Description            |
| -------- | ------------------------- | ---------------------- |
| `GET`    | `/api/pages`              | List all pages (tree)  |
| `GET`    | `/api/pages/:id`          | Page with blocks       |
| `POST`   | `/api/pages`              | Create page            |
| `PATCH`  | `/api/pages/:id`          | Update title/icon      |
| `DELETE` | `/api/pages/:id`          | Delete page (cascades) |
| `PATCH`  | `/api/pages/reorder/bulk` | Reorder pages          |

### Blocks

| Method   | Endpoint                   | Description                        |
| -------- | -------------------------- | ---------------------------------- |
| `POST`   | `/api/blocks/:pageId`      | Add block                          |
| `PATCH`  | `/api/blocks/:id`          | Update block                       |
| `DELETE` | `/api/blocks/:id`          | Delete block                       |
| `PATCH`  | `/api/blocks/:pageId/bulk` | Save all blocks + version snapshot |

### AI

| Method | Endpoint               | Body                   | Description                  |
| ------ | ---------------------- | ---------------------- | ---------------------------- |
| `POST` | `/api/ai/summarize`    | `{ content }`          | Summarize page text          |
| `POST` | `/api/ai/improve`      | `{ content }`          | Improve writing quality      |
| `POST` | `/api/ai/fix-grammar`  | `{ content }`          | Fix grammar & spelling       |
| `POST` | `/api/ai/make-shorter` | `{ content }`          | Make text concise            |
| `POST` | `/api/ai/make-longer`  | `{ content }`          | Expand text                  |
| `POST` | `/api/ai/change-tone`  | `{ content, tone }`    | Change writing tone          |
| `POST` | `/api/ai/suggest-tags` | `{ content }`          | Auto-suggest tags            |
| `POST` | `/api/ai/generate`     | `{ prompt, context? }` | Generate content from prompt |
| `POST` | `/api/ai/complete`     | `{ content }`          | Continue writing             |

### Search & Versions

| Method | Endpoint                                   | Description      |
| ------ | ------------------------------------------ | ---------------- |
| `GET`  | `/api/search?q=query`                      | Full-text search |
| `GET`  | `/api/versions/:pageId`                    | Version history  |
| `POST` | `/api/versions/:pageId/restore/:versionId` | Restore version  |

---

## Deploy

### Free tier stack

| Service  | Provider                                        | Free Plan              |
| -------- | ----------------------------------------------- | ---------------------- |
| Frontend | [Vercel](https://vercel.com)                    | Unlimited for personal |
| Backend  | [Railway](https://railway.app)                  | $5/month credit        |
| Database | [Neon](https://neon.tech)                       | 0.5 GB free            |
| AI       | [Google AI Studio](https://aistudio.google.com) | 1M tokens/day          |

### Frontend → Vercel

```bash
# Install Vercel CLI
npm i -g vercel

cd apps/frontend
vercel
```

Set environment variable in Vercel dashboard:

```
VITE_API_URL=https://your-backend.railway.app
VITE_WS_URL=https://your-backend.railway.app
```

### Backend → Railway

1. Push code to GitHub
2. New project → Deploy from GitHub repo
3. Set root directory: `apps/backend`
4. Add environment variables (same as `.env`)
5. Add PostgreSQL plugin or use Neon

### Database → Neon

1. Create project at [neon.tech](https://neon.tech)
2. Copy connection string
3. Set as `DATABASE_URL` on Railway
4. Run `npx prisma migrate deploy` in Railway deploy command

---

## Project Structure

```
ai-knowledge-workspace/
├── apps/
│   ├── backend/                  Node.js + Express + Prisma
│   │   ├── src/
│   │   │   ├── modules/          auth · pages · blocks · ai · search · versions
│   │   │   ├── websocket/        Socket.IO gateway
│   │   │   ├── middleware/       auth · error handler
│   │   │   └── __tests__/        Integration tests
│   │   └── prisma/               Schema + migrations + seed
│   └── frontend/                 Vue 3 + Vite
│       └── src/
│           ├── components/       editor · ai · search · versions · presence · sidebar
│           ├── composables/      useAI · useSocket · useTheme · useMarkdownExport
│           ├── stores/           auth · pages (Pinia)
│           ├── views/            Workspace · Page · Auth · Home
│           └── __tests__/        Unit tests
├── docker-compose.yml
└── package.json                  npm workspaces
```

---

## WebSocket Events

| Event (client → server) | Payload                   | Description               |
| ----------------------- | ------------------------- | ------------------------- |
| `join-page`             | `pageId`                  | Enter page room           |
| `leave-page`            | `pageId`                  | Leave page room           |
| `blocks-changed`        | `{ pageId, blocks }`      | Broadcast block updates   |
| `cursor-move`           | `{ pageId, blockId }`     | Broadcast cursor position |
| `page-title-changed`    | `{ pageId, title, icon }` | Broadcast title change    |

| Event (server → client) | Payload                       | Description                    |
| ----------------------- | ----------------------------- | ------------------------------ |
| `user-joined`           | `PresenceUser`                | Someone joined the page        |
| `user-left`             | `{ socketId, userId }`        | Someone left                   |
| `presence-list`         | `PresenceUser[]`              | Current users in room          |
| `blocks-updated`        | `{ blocks, by }`              | Blocks changed by another user |
| `cursor-update`         | `PresenceUser`                | Cursor moved                   |
| `page-title-updated`    | `{ pageId, title, icon, by }` | Title changed                  |

---

<div align="center">
  Built with ❤️ using Vue 3, Node.js, Prisma, and Google Gemini
</div>
