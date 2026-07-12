# AssetFlow Backend

**Enterprise Asset & Resource Management System** — Production-ready backend foundation built with Node.js, Express, TypeScript, Prisma, and PostgreSQL (Supabase).

---

## Tech Stack

| Layer        | Technology                        |
| ------------ | --------------------------------- |
| Runtime      | Node.js                           |
| Framework    | Express.js                        |
| Language     | TypeScript                        |
| ORM          | Prisma                            |
| Database     | PostgreSQL (Supabase)             |
| Validation   | Zod                               |
| Security     | Helmet, CORS, express-rate-limit  |
| Logging      | Morgan                            |
| Dev Server   | tsx (watch mode)                   |

---

## Installation

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Generate the Prisma client
npm run prisma:generate
```

---

## Environment Variables

Copy the example env file and fill in your Supabase credentials:

```bash
cp .env.example .env
```

| Variable       | Description                              |
| -------------- | ---------------------------------------- |
| `PORT`         | Server port (default `8000`)             |
| `DATABASE_URL` | Supabase pooled connection string        |
| `DIRECT_URL`   | Supabase direct connection string        |
| `NODE_ENV`     | `development` / `production` / `test`    |
| `CLIENT_URL`   | Frontend origin for CORS (e.g. `http://localhost:3000`) |

---

## Run Development

```bash
npm run dev
```

The server starts on `http://localhost:8000` (or whichever port you configure).

### Health Check

| Endpoint       | Response                                               |
| -------------- | ------------------------------------------------------ |
| `GET /`        | `{ success: true, message: "AssetFlow Backend Running" }` |
| `GET /api/health` | `{ success: true, database: "connected", uptime: … }` |

---

## Prisma Commands

```bash
# Generate the Prisma client after schema changes
npm run prisma:generate

# Create and apply a new migration
npm run prisma:migrate

# Open Prisma Studio (visual DB browser)
npm run prisma:studio
```

---

## Build & Start (Production)

```bash
npm run build    # Compile TypeScript → dist/
npm start        # Run the compiled JS
```

---

## Scripts

| Script              | Command                      | Description                       |
| ------------------- | ---------------------------- | --------------------------------- |
| `dev`               | `tsx watch src/server.ts`    | Start dev server with hot-reload  |
| `build`             | `tsc`                        | Compile TypeScript                |
| `start`             | `node dist/server.js`        | Run production build              |
| `prisma:generate`   | `prisma generate`            | Generate Prisma client            |
| `prisma:migrate`    | `prisma migrate dev`         | Run database migrations           |
| `prisma:studio`     | `prisma studio`              | Open Prisma Studio                |
| `lint`              | `tsc --noEmit`               | Type-check without emitting       |

---

## Folder Structure

```
backend/
│
├── prisma/
│   ├── schema.prisma          # Database schema (generator + datasource only)
│   └── migrations/            # Auto-generated migration files
│
├── src/
│   ├── app.ts                 # Express application factory
│   ├── server.ts              # Entry point — bootstrap & graceful shutdown
│   │
│   ├── config/                # Centralised configuration
│   │   ├── env.ts             #   Environment variable validation
│   │   ├── prisma.ts          #   Singleton PrismaClient
│   │   ├── cors.ts            #   CORS options
│   │   └── logger.ts          #   Morgan format selection
│   │
│   ├── routes/                # Route definitions
│   │   └── index.ts           #   Root API router (/api/health)
│   │
│   ├── middleware/            # Express middleware
│   │   ├── error.middleware.ts        # Global error handler
│   │   ├── notFound.middleware.ts     # 404 catch-all
│   │   └── requestLogger.middleware.ts # Structured request logger
│   │
│   ├── utils/                 # Reusable utilities
│   │   ├── ApiResponse.ts     #   Standardised success response
│   │   ├── ApiError.ts        #   Custom operational error class
│   │   └── asyncHandler.ts    #   Async route handler wrapper
│   │
│   ├── constants/             # Application constants
│   │   └── app.ts             #   App name, API prefix, rate-limit config
│   │
│   ├── types/                 # TypeScript type augmentations
│   │   └── express.d.ts       #   Express Request extensions
│   │
│   └── modules/               # Feature modules (to be implemented)
│       ├── auth/
│       ├── dashboard/
│       ├── department/
│       ├── employee/
│       ├── asset/
│       ├── allocation/
│       ├── booking/
│       ├── maintenance/
│       ├── audit/
│       ├── report/
│       └── notification/
│
├── .env                       # Environment variables (git-ignored)
├── .env.example               # Template for required variables
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

### Why each folder exists

| Folder          | Purpose                                                                 |
| --------------- | ----------------------------------------------------------------------- |
| `config/`       | Single source of truth for all external configuration (env, DB, CORS).  |
| `routes/`       | Declarative route mounting — keeps `app.ts` clean.                      |
| `middleware/`    | Cross-cutting concerns (logging, error handling, auth in future).       |
| `utils/`        | Framework-agnostic helpers shared across the entire application.        |
| `constants/`    | Magic numbers and strings defined once, referenced everywhere.          |
| `types/`        | TypeScript augmentations and shared interfaces.                         |
| `modules/`      | Feature-sliced vertical modules — each gets its own router, controller, service, and validation in subsequent phases. |

---

## License

ISC
