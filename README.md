# BloodLink 🩸

A full-stack Blood Donor & Recipient Platform connecting people who need blood with willing donors in real-time.

## Features

- **User Registration** — Sign up as a donor, recipient, or both with blood type and location
- **Blood Requests** — Create requests with blood type, urgency level (Critical/Urgent/Routine), hospital details
- **Smart Matching** — Auto-notify compatible donors when a new request is posted
- **Privacy First** — Donor contact info hidden until they click "Willing to Donate"
- **Real-time Chat** — In-app messaging between matched donor-recipient pairs via Socket.io
- **Donor Leaderboard** — Gamification with donation tracking and badges
- **Push Notifications** — Stay updated on new requests and messages
- **Responsive Web + Mobile** — Next.js web app and React Native (Expo) mobile app

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend API | Node.js, Express, TypeScript, Prisma ORM |
| Database | PostgreSQL |
| Real-time | Socket.io |
| Auth | JWT + bcrypt |
| Web Frontend | Next.js 16, React 19, Tailwind CSS |
| Mobile App | React Native (Expo), TypeScript |
| Validation | Zod |

## Project Structure

```
bloodlink/
├── apps/
│   ├── api/          # Express + Prisma backend API
│   │   ├── prisma/   # Database schema & migrations
│   │   └── src/
│   │       ├── routes/       # Auth, requests, chat, users, notifications
│   │       ├── middleware/   # JWT auth middleware
│   │       ├── services/     # Socket.io setup
│   │       └── utils/        # Zod validation schemas
│   ├── web/          # Next.js 16 web application
│   │   └── src/
│   │       ├── app/          # App Router pages
│   │       ├── components/   # Reusable UI components
│   │       ├── contexts/     # Auth context
│   │       └── lib/          # API client, socket helpers
│   └── mobile/       # Expo React Native app
│       └── src/
│           ├── screens/      # App screens
│           ├── navigation/   # React Navigation setup
│           ├── contexts/     # Auth context
│           └── lib/          # API client
└── packages/
    └── shared/       # Shared types & utilities
```

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- npm 10+

### 1. Install dependencies

```bash
npm install
```

### 2. Set up the database

```bash
cd apps/api
cp .env.example .env
# Edit .env with your PostgreSQL connection string

npx prisma migrate dev --name init
npx prisma generate
```

### 3. Start the API server

```bash
npm run dev:api
```

### 4. Start the web app

```bash
npm run dev:web
```

### 5. Start the mobile app

```bash
cd apps/mobile
npx expo start
```

## API Endpoints

### Auth
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user

### Blood Requests
- `POST /api/requests` — Create a blood request
- `GET /api/requests` — List requests (with filters)
- `GET /api/requests/:id` — Get request details
- `POST /api/requests/:id/respond` — Respond to a request (willing to donate)
- `PATCH /api/requests/:id/status` — Update request status
- `GET /api/requests/my/requests` — Get my requests

### Chat
- `GET /api/chat/rooms` — Get chat rooms
- `GET /api/chat/rooms/:roomId/messages` — Get messages
- `POST /api/chat/rooms/:roomId/messages` — Send message

### Users
- `PATCH /api/users/profile` — Update profile
- `GET /api/users/leaderboard` — Donor leaderboard
- `GET /api/users/:id` — Public profile
- `GET /api/users/search/donors` — Search donors

### Notifications
- `GET /api/notifications` — Get notifications
- `PATCH /api/notifications/:id/read` — Mark as read

## License

MIT
