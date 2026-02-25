# Child Safety QR – Frontend

Next.js 14 PWA frontend with Tailwind CSS, real-time Socket.io alerts, and mobile-first UI for the Child Safety QR Tracking System (India-ready).

## Features

- **Auth**: Login / Register with session (JWT in localStorage)
- **Parent dashboard**: List children, real-time scan alerts
- **Child onboarding**: Add child, upload photo, generate & download QR code
- **Real-time**: Socket.io client for instant notifications when QR is scanned
- **Scan history**: Table and map view with OpenStreetMap
- **Public scan page**: `/scan/[secureId]` – mobile-friendly, location permission, optional continuous tracking
- **PWA**: Installable, offline support, push-ready (add icons under `public/icons/`)
- **UI**: Responsive, dark mode (class-based), Tailwind

## Folder structure

```
frontend/
├── src/
│   ├── app/              # App Router pages
│   │   ├── dashboard/
│   │   ├── children/
│   │   │   ├── [id]/     # Child detail + map
│   │   │   └── new/
│   │   ├── scan/[secureId]/  # Public scan page
│   │   ├── login/
│   │   └── register/
│   ├── components/       # Layout, MapView, ThemeProvider, ProtectedRoute
│   ├── context/          # AuthContext, SocketContext
│   ├── services/         # api.ts
│   └── hooks/            # (optional)
├── public/
│   ├── manifest.json
│   └── icons/            # Add icon-192.png, icon-512.png
├── .env.example
└── package.json
```

## Setup

### Prerequisites

- Node.js >= 18
- Backend running (see `../backend/README.md`)

### Install and run

```bash
cd frontend
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL and NEXT_PUBLIC_WS_URL to your backend URL (e.g. http://localhost:5000)
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL (e.g. http://localhost:5000) |
| `NEXT_PUBLIC_WS_URL` | Backend URL for Socket.io (same as API in most cases) |

## Deployment

- **Vercel**: Connect repo, set env vars, deploy. Set `NEXT_PUBLIC_*` in project settings.
- **Docker**: Use `node:20-alpine`, build with `npm run build`, run `npm start` (port 3000).
- Ensure backend CORS includes your frontend origin and that Socket.io is reachable (same host or proxy WebSocket).

## PWA icons

Add `public/icons/icon-192.png` and `public/icons/icon-512.png` for install prompt and splash. See `public/icons/README.md`.

## Example flow

1. Register → Login → Add child (name, age, photo, emergency contacts).
2. Open child detail → view QR, download PNG, open “Scan page” link.
3. On another device (or incognito), open `/scan/[secureId]` → allow location → “Share my location”.
4. Parent dashboard gets real-time alert; scan history and map update.
