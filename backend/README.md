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

## Resource Booking & Maintenance System Spec

### 1. New API Modules & Endpoints

#### Resources (`/api/resources`)
- `GET /` — List resources (filters: `type`, `status`)
- `GET /:id` — Retrieve a single resource
- `POST /` — Add new resource (Admin/Asset Manager only)
- `PATCH /:id` — Edit resource details (Admin/Asset Manager only)
- `DELETE /:id` — Delete a resource (Admin only)

#### Bookings (`/api/bookings`)
- `GET /` — List bookings (filters: `resourceId`, `status`, `type`, `userId`)
- `GET /calendar` — Range-based bookings list
- `GET /calendar/availability` — Hourly/30-min block availability array for a resource on a specific date
- `POST /` — Request a booking (checks capacities, trip purpose, and locks)
- `PATCH /:id` — Update pending booking (Owner or Admin/Manager only)
- `PUT /:id/cancel` — Cancel active booking (Owner or Admin/Manager only)
- `PUT /:id/approve` — Approve pending booking (Admin/Manager only)
- `PUT /:id/reject` — Reject pending booking with reason (Admin/Manager only)

#### Maintenance (`/api/maintenance`)
- `GET /` — List requests (filters: `resourceId`, `status`, `reported_by`)
- `POST /` — Report a defect or submit a repair request
- `PATCH /:id` — Edit reported issue
- `PUT /:id/approve` — Schedule and approve maintenance (cancels overlapping bookings)
- `PUT /:id/reject` — Reject maintenance request with reason
- `PUT /:id/start` — Mark scheduled task as `IN_PROGRESS` (sets resource status to `MAINTENANCE`)
- `PUT /:id/complete` — Mark task as `COMPLETED` (sets resource status back to `AVAILABLE`)
- `PUT /:id/cancel` — Cancel maintenance task

#### Notifications (`/api/notifications`)
- `GET /` — Fetch notifications list for logged-in user
- `PUT /read-all` — Mark all unread notifications as read
- `PUT /:id/read` — Mark a single notification as read
- `DELETE /:id` — Delete notification item

---

### 2. Core Design Decisions

#### A. Equipment Multi-Unit Availability Logic
For assets where quantity > 1 (e.g. 10 identical laptops under one resource record):
- We do not lock the resource entirely for overlapping windows.
- Availability check dynamically queries the maximum overlap in any selected slot.
- Booking creation executes inside an interactive transaction using Postgres `SELECT FOR UPDATE` on the resource row to serialize concurrent writes and prevent race conditions. If `current_overlap_count + 1 > quantity`, the booking is rejected with `409 Conflict`.

#### B. Maintenance Approval & Auto-Cancel Policy
By default, approving a maintenance request automatically:
1. Schedules the maintenance window.
2. Identifies all overlapping `PENDING` and `APPROVED` bookings.
3. Automatically marks them as `CANCELLED` with a description detailing the maintenance schedule.
4. Generates instant notifications for all affected booking owners explaining the cancellation reason.
*Can be toggled to "Block new bookings only" by setting `MAINTENANCE_AUTO_CANCEL = false` in `maintenance.service.ts`.*

#### C. Background Cron Jobs & Scheduling
Background checking is handled using `node-cron`:
- **Maintenance Starting Soon**: Runs every hour to check for approved requests starting within 24 hours. Warns both the reporter and the manager.
- **Upcoming Booking Reminder**: Runs every 15 minutes to warn users 1 hour before their booking starts.

---

## License

ISC
