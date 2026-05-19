# 🔱 SnapViewer

A modern Snapchat profile viewer built with **Node.js** backend + **React + Vite + TypeScript** frontend.

---

## ✨ Features

- **Home** — Hero section with background video + featured profile showcase
- **Search** — Live Snapchat username lookup with recent history
- **API Preferences** — Cache control, TTL config, cache management
- Smooth Framer Motion animations throughout
- Glassmorphism UI with Snapchat yellow accent
- Fully responsive (mobile, tablet, desktop)
- In-memory caching with configurable TTL
- Highlights grid + Spotlight grid with thumbnails

---

## 🚀 Quick Start

### 1. Place your background video

Drop your video file at:
```
frontend/public/videos/bg.mp4
```

Any `.mp4` works — the video plays muted, looped, and auto-plays behind the hero.

### 2. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Run both servers

**Terminal 1 — Backend (port 3001)**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend (port 5173)**
```bash
cd frontend
npm run dev
```

### 4. Open the app

Visit **http://localhost:5173**

---

## 📁 Project Structure

```
snapviewer/
├── backend/
│   ├── server.js          # Express API + proxy + cache
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── videos/
│   │       └── bg.mp4     ← PUT YOUR VIDEO HERE
│   ├── src/
│   │   ├── components/
│   │   │   ├── Home.tsx         # Hero + featured profile
│   │   │   ├── SearchPage.tsx   # Search interface
│   │   │   ├── Preferences.tsx  # API settings
│   │   │   └── ProfileCard.tsx  # Shared profile display
│   │   ├── hooks/
│   │   │   └── api.ts           # API service functions
│   │   ├── types.ts             # TypeScript types
│   │   ├── App.tsx              # Router + nav
│   │   └── main.tsx
│   ├── vite.config.ts
│   └── package.json
```

---

## 🔌 Backend API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/snap?username=xxx` | Fetch Snap profile |
| GET | `/api/settings` | Get cache settings |
| PUT | `/api/settings` | Update cache settings (`{ enabled, ttl }`) |
| DELETE | `/api/cache` | Clear all cached profiles |
| DELETE | `/api/cache/:username` | Clear one user's cache |
| GET | `/api/health` | Server health check |

---

## 🎨 Design

- **Fonts:** Syne (display) + DM Sans (body)
- **Accent:** Snapchat Yellow (`#FFFC00`)
- **Theme:** Dark with glassmorphism cards
- **Animations:** Framer Motion page transitions + stagger reveals
