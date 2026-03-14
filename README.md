# 🧠 AI Knowledge Workspace

A full-stack knowledge management app with block editor, AI integration, and real-time collaboration.

**Stack:** Vue 3 + Vite · Node.js + Express · Prisma ORM · PostgreSQL · WebSockets · Docker

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker + Docker Compose

### 1. Clone and install

```bash
git clone https://github.com/youruser/ai-knowledge-workspace.git
cd ai-knowledge-workspace
npm install
```

### 2. Set up environment

```bash
cp apps/backend/.env.example apps/backend/.env
# Edit .env if needed (defaults work with Docker)
```

### 3. Start the database

```bash
npm run docker:up
# Waits for postgres to be ready
```

### 4. Run migrations + seed

```bash
npm run db:migrate       # Apply schema
npm run db:seed          # Demo user + sample data
```

### 5. Start development servers

```bash
npm run dev
# Backend:  http://localhost:3000
# Frontend: http://localhost:5173
```

---

## 🔑 Demo Credentials

```
Email:    demo@workspace.dev
Password: demo123
```

---

## 📁 Project Structure

```
ai-knowledge-workspace/
├── apps/
│   ├── backend/          Node.js + Express + Prisma
│   │   ├── src/
│   │   │   ├── modules/  auth · pages · blocks
│   │   │   ├── middleware/
│   │   │   └── server.ts
│   │   └── prisma/       schema + migrations + seed
│   └── frontend/         Vue 3 + Vite + Pinia
│       └── src/
│           ├── components/editor/  Block editor
│           ├── stores/             Pinia state
│           ├── views/              Pages + Auth
│           └── router/
├── docker-compose.yml
└── package.json          npm workspaces
```

---

## 🌐 API Reference

### Auth

| Method | Route                | Description    |
| ------ | -------------------- | -------------- |
| POST   | `/api/auth/register` | Create account |
| POST   | `/api/auth/login`    | Sign in → JWT  |
| GET    | `/api/auth/me`       | Current user   |

### Pages

| Method | Route                     | Description       |
| ------ | ------------------------- | ----------------- |
| GET    | `/api/pages`              | List all pages    |
| GET    | `/api/pages/:id`          | Page + blocks     |
| POST   | `/api/pages`              | Create page       |
| PATCH  | `/api/pages/:id`          | Update title/icon |
| DELETE | `/api/pages/:id`          | Delete page       |
| PATCH  | `/api/pages/reorder/bulk` | Reorder pages     |

### Blocks

| Method | Route                      | Description                 |
| ------ | -------------------------- | --------------------------- |
| POST   | `/api/blocks/:pageId`      | Add block                   |
| PATCH  | `/api/blocks/:id`          | Update block                |
| DELETE | `/api/blocks/:id`          | Delete block                |
| PATCH  | `/api/blocks/:pageId/bulk` | Save all + version snapshot |

---

## 🗄️ Database

```bash
npm run db:studio     # Open Prisma Studio (GUI)
npm run db:migrate    # Apply new migrations
npm run db:generate   # Regenerate Prisma client
```

---
