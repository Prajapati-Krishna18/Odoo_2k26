# AssetFlow Backend — Core Infrastructure & Setup

**Enterprise Asset & Resource Management System** — Production-ready Express & TypeScript backend built with modular vertical architecture, Prisma 7 ORM, and PostgreSQL (Supabase).

---

## 🛠️ Technology Stack

| Layer        | Technology                        |
| ------------ | --------------------------------- |
| Runtime      | Node.js                           |
| Framework    | Express.js                        |
| Language     | TypeScript (strict mode, ES2022/NodeNext) |
| ORM          | Prisma ORM (v7.8.0 with `@prisma/adapter-pg` Driver Adapter) |
| Database     | PostgreSQL (Supabase)             |
| Validation   | Zod                               |
| Encryption   | Bcrypt (12 rounds)                |
| Auth tokens  | JsonWebToken (JWT)                |
| Security     | Helmet, CORS, express-rate-limit  |
| Logging      | Morgan & custom ISO request logger |
| Dev Server   | tsx (watch mode)                   |

---

## 💻 Frontend Integration

The frontend of this application is developed separately. The backend integrates with it through standard REST API endpoints.

To connect the frontend:
1.  Verify the `CLIENT_URL` environment variable matches your frontend URL (e.g. `http://localhost:3000`).
2.  Enable cookie credentials support on your frontend request builder (e.g. Axios `withCredentials: true` or Fetch `credentials: 'include'`).
3.  Target HTTP endpoints using the `/api` prefix (e.g. `http://localhost:8000/api`).

---

## 🚀 Key Modules Built

### 1. Authentication & RBAC (`src/modules/auth`)
*   **Endpoints:**
    *   `POST /api/auth/register` — Create a default `EMPLOYEE` profile.
    *   `POST /api/auth/login` — Verifies password, returns access/refresh token pair and user profile.
    *   `POST /api/auth/refresh-token` — Rotates and returns a new short-lived access token.
    *   `POST /api/auth/logout` — Revokes and deletes session refresh token from the database.
    *   `GET /api/auth/me` — Fetches current user profile details (protected).
*   **Security Middlewares:**
    *   `authenticate` — Parses Bearer tokens from `Authorization` header, decrypts JWT, and binds payload to `req.user`.
    *   `authorize(...roles)` — RBAC validation checking user role limits.

### 2. Department Management (`src/modules/department`)
*   **Endpoints:**
    *   `POST /api/departments` — Creates a new department.
    *   `GET /api/departments` — Lists departments (supports pagination, keyword search, status filter, and sorting).
    *   `GET /api/departments/:id` — Retrives full department details (including parent and head profile).
    *   `PATCH /api/departments/:id` — Updates department properties.
    *   `PATCH /api/departments/:id/status` — Toggles active/inactive status.
    *   `DELETE /api/departments/:id` — Soft-deletes department (blocks action if active employees or sub-departments remain).

### 3. Asset Category Directory (`src/modules/category`)
*   **Endpoints:**
    *   `POST /api/categories` — Creates an asset category.
    *   `GET /api/categories` — Lists categories (supports pagination, sorting, search, and status filtering).
    *   `GET /api/categories/:id` — Retrieves category details.
    *   `PATCH /api/categories/:id` — Updates category properties.
    *   `PATCH /api/categories/:id/status` — Toggles active/inactive status.
    *   `DELETE /api/categories/:id` — Soft-deletes category.

### 4. Employee Directory (`src/modules/employee`)
*   **Endpoints:**
    *   `GET /api/employees` — Lists all employees (supports pagination, search, department/role/status filters).
    *   `GET /api/employees/:id` — Retrieves employee profile details.
    *   `PATCH /api/employees/:id` — Updates employee profile.
    *   `PATCH /api/employees/:id/status` — Toggles active/inactive status (activations automatically generate sequential employee codes).
    *   `PATCH /api/employees/:id/promote` — Change user role (restricted to Admins; self-promotion blocked).
    *   `PATCH /api/employees/:id/department` — Transfer employee (blocks transfers to inactive target departments).

---

## 💻 Installation & Local Running

1.  **Navigate to directory & install:**
    ```bash
    cd backend
    npm install
    ```
2.  **Environment Setup:**
    Configure variables in `.env` (refer to `.env.example`):
    ```bash
    cp .env.example .env
    ```
3.  **Prisma Code Generation:**
    Generate client libraries matching the schema:
    ```bash
    npm run prisma:generate
    ```
4.  **Database Migration:**
    Push schema to your PostgreSQL database (creates all tables):
    ```bash
    npm run prisma:migrate
    ```
5.  **Seeding:**
    Prepopulate database with default roles and System Admin account:
    ```bash
    npm run prisma:seed
    ```
6.  **Run Development Server:**
    ```bash
    npm run dev
    ```

---

## 📂 Project Architecture

```
backend/
├── prisma/
│   ├── schema.prisma          # Database schema models
│   ├── prisma.config.ts       # Prisma 7 configurations (connection string mappings)
│   └── seed.ts                # Seeding configuration
│
├── src/
│   ├── app.ts                 # Express application middleware wireup
│   ├── server.ts              # Entry point bootstrap & graceful shutdown
│   │
│   ├── config/                # App-wide configurations
│   │   ├── env.ts             #   Environment variable validation
│   │   ├── prisma.ts          #   Singleton PrismaClient with PG adapter
│   │   ├── cors.ts            #   CORS origins
│   │   └── logger.ts          #   Morgan format
│   │
│   ├── routes/                # Index route registration
│   │   └── index.ts
│   │
│   ├── middleware/            # Core middlewares
│   │   ├── auth.middleware.ts          # JWT Authentication & RBAC Authorization
│   │   ├── error.middleware.ts         # Standard error wrapper
│   │   ├── notFound.middleware.ts      # 404 handler
│   │   └── requestLogger.middleware.ts # Structured access logs
│   │
│   ├── utils/                 # Reuseable helpers
│   │   ├── ApiError.ts        #   Custom error class
│   │   ├── ApiResponse.ts     #   Standard response structure
│   │   ├── asyncHandler.ts    #   Async promise catch helper
│   │   ├── bcrypt.ts          #   Bcrypt wrapper
│   │   └── jwt.ts             #   JWT wrapper
│   │
│   ├── constants/             # Application constants
│   ├── types/                 # Express Request augmentations
│   │
│   └── modules/               # Vertical slice modules
│       ├── auth/
│       ├── department/
│       ├── category/
│       └── employee/
│
├── tsconfig.json              # Developer TS settings
├── tsconfig.build.json        # Strict compilation build TS settings
└── postman_collection.json    # Ready-to-import Postman collections
```

---

## 📋 Script Operations

*   `npm run dev` — Launches dev server with hot reload via `tsx watch`.
*   `npm run build` — Compiles TypeScript to JS in `dist/` (using `tsconfig.build.json` to ignore root configuration files).
*   `npm start` — Executes compiled JS code.
*   `npm run lint` — Runs TypeScript compile check (`tsc --noEmit`) to verify types.
*   `npm run prisma:studio` — Opens Prisma GUI visual database editor.
