# AssetFlow — Enterprise Asset & Resource Management System

AssetFlow is a production-ready Enterprise Resource Planning (ERP) backend built to handle corporate assets, category configurations, employee rosters, and department setups. It implements secure token authentication and strict Role-Based Access Control (RBAC).

---

## 🚀 Key Modules Built

### 1. Authentication & Session Security (Phase 2)
*   **Secure Access Control:** Fully stateless authorization using short-lived JWT Access Tokens combined with database-tracked Refresh Tokens (supporting session revocation and rotation).
*   **Password Security:** Hashed with `bcrypt` using 12 salt rounds.
*   **Default Employee Registration:** All new registrations default to the `EMPLOYEE` role. Role customization is restricted; only `ADMIN` users can promote roles.

### 2. Organization Setup (Phase 3)
*   **Department Management:**
    *   Self-referencing parent/child relationships (preventing self-parent loops).
    *   Validation checks ensuring only `ACTIVE` departments can receive employees.
    *   Protected soft deletes that block deletion if active employees or sub-departments remain.
*   **Asset Category Directory:**
    *   Unique category naming, description parameters, icon class settings, and warranty flags.
    *   Full status toggle activations and soft deletions.
*   **Employee Directory:**
    *   Administrative control for promoting employees (`EMPLOYEE` → `DEPARTMENT_HEAD` → `ASSET_MANAGER`).
    *   Administrative department transfers (restricted to `ACTIVE` target departments).
    *   Automatic generation of structured sequential employee codes (e.g. `EMP-2026-0001`) upon employee activation.

---

## 🛠️ Technology Stack

*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Language:** TypeScript (Strict Type Checking, ES2022/NodeNext)
*   **ORM:** Prisma ORM v7 (configured with Driver Adapters)
*   **Database:** PostgreSQL (Supabase)
*   **Validation:** Zod
*   **Security:** Helmet, CORS, Express Rate Limit

---

## 📂 Project Architecture

AssetFlow follows a **modular vertical slice architecture** combined with the **Repository-Service-Controller** design pattern:

*   **`controllers/`**: Parses and validates query/body properties (using Zod schemas), delegates actions, and wraps responses using `ApiResponse`.
*   **`services/`**: Implements core domain logics and business validations.
*   **`repositories/`**: Contains direct database queries via Prisma, keeping database interactions segregated.

---

## 💻 Frontend Integration

The frontend of this application is developed separately. The backend integrates with it through standard REST API endpoints.

To connect the frontend to the backend:
1.  Ensure the frontend origin is correctly configured in the backend `.env` file under `CLIENT_URL` (e.g. `CLIENT_URL="http://localhost:3000"`).
2.  The backend will allow cross-origin requests from this specified client origin with credentials (cookies) enabled.
3.  Configure the frontend API client base URL to point to the backend server (e.g. `http://localhost:8000/api`).

---

## 💻 Setup & Installation

To run the backend locally:

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure your environment variables in `.env` (refer to `.env.example`):
    ```bash
    cp .env.example .env
    ```
4.  Generate the Prisma Client:
    ```bash
    npm run prisma:generate
    ```
5.  Run database migrations:
    ```bash
    npm run prisma:migrate
    ```
6.  Seed default roles and System Admin account:
    ```bash
    npm run prisma:seed
    ```
7.  Start the development server:
    ```bash
    npm run dev
    ```

For detailed API definitions, scripts, folder mappings, and database relationship structures, see the [backend/README.md](file:///d:/Full_Stack/Odoo_Hackathon/Odoo_2k26/backend/README.md).