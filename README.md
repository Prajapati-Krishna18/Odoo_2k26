# 🌌 AssetFlow — Enterprise Asset & Resource Management System

<div align="center">

[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Express](https://img.shields.io/badge/Express-4-green?style=for-the-badge&logo=express)](https://expressjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-7-indigo?style=for-the-badge&logo=prisma)](https://prisma.io)
[![Postgres](https://img.shields.io/badge/PostgreSQL-16-blue?style=for-the-badge&logo=postgresql)](https://www.postgresql.org)
[![Gemini](https://img.shields.io/badge/Gemini_AI-Enabled-cyan?style=for-the-badge&logo=google-gemini)](https://deepmind.google/technologies/gemini)

**An intelligent, enterprise-grade ERP workspace for corporate assets, bookings, custody transfers, and AI-driven infrastructure analytics.**

🔗 **Live Demo:** [odoo-2k26.vercel.app](https://odoo-2k26.vercel.app)

[Key Features](#-key-features) • [Tech Stack](#-technology-stack) • [Installation](#-setup--installation) • [AI Assistant](#-gemini-ai-assistant)

</div>

---

## 🚀 Key Features

### 🤖 Gemini AI Assistant
* **Smart Intent Recognition**: Automatically matches natural language queries to custom database operations (e.g., *"Who has laptop AF-0114?"*, *"Show me overdue resources"*).
* **Deep Database Context**: Dynamically injects context (assets, roles, active transfer requests, logs) into the LLM system prompt.
* **Intelligent Recommendations**: Recommends resource allocations and flags capacity warning signals in real time.

### 🔒 Authentication & Session Security
* **Stateless Authorization**: Short-lived JWT Access Tokens paired with database-tracked Refresh Tokens (supporting token rotation and revocation).
* **Role-Based Access Control (RBAC)**: Custom routing protection restricting views between `Admin`, `Asset Manager`, `Department Head`, and `Employee`.
* **Secured Password Hashing**: Hashed using `bcrypt` (12 salt rounds) with built-in login rate-limiting.

### 📂 Organization Setup & Hierarchy
* **Self-Referencing Departments**: Structured parent-child trees that prevent circular loops and track employee assignments dynamically.
* **Custom Asset Categories**: Structured category trees with custom properties, status switches, and soft-delete guards.
* **Roster Management**: Automated generation of sequential employee codes (e.g., `EMP-2026-0001`) and role promotion triggers.

### 📅 Resource Booking & Scheduler
* **Visual Timelines**: Multi-view grid showing weekly slot allocations for Rooms, Vehicles, and Equipment.
* **Race Condition Mitigation**: Employs Postgres exclusion constraints (`btree_gist`) to guarantee slot exclusivity at the DB level, and row-locking transactions for multi-quantity items.

---

## 🛠️ Technology Stack

| Frontend Layer | Backend Core | Database & Infrastructure |
| :--- | :--- | :--- |
| **Vite** + **React 19** | **Node.js** + **Express.js** | **PostgreSQL** (Supabase) |
| **TypeScript** (Strict Mode) | **TypeScript** (ES2022/NodeNext) | **Prisma ORM** (Driver Adapters) |
| **Lucide Icons** | **Zod** (API Payload Validation) | **Gemini Pro API** (Google GenAI SDK) |
| **Vanilla CSS** (Premium Theme) | **Helmet, CORS, Rate Limit** | **Postgres exclusion constraints** |

---

## 📂 Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/          # Environment & Gemini setups
│   │   ├── middleware/      # Auth & RBAC checks
│   │   ├── modules/         # Vertical slices (AI, Asset, Booking, Org, etc.)
│   │   │   ├── ai/          # Google Gemini assistant controller/services
│   │   │   ├── auth/        # Token validation & authentication
│   │   │   ├── booking/     # Resource allocation and availability scheduling
│   │   │   └── employee/    # Employee roster & promotion hooks
│   │   └── routes/          # Unified Express route handlers
│   └── prisma/              # Schema definitions and seeding
└── frontend/
    ├── src/
    │   ├── api/             # Typed API clients for unified backend communication
    │   ├── components/      # Reusable controls (StateRail lifecycle, Searchable selectors)
    │   ├── context/         # AuthContext session state & hydration hooks
    │   └── pages/           # Premium themed layouts (Bookings, Assets, Org Setup)
```

---

## 💻 Setup & Installation

### 1️⃣ Clone and Prepare Env
```bash
git clone https://github.com/Prajapati-Krishna18/Odoo_2k26.git
cd Odoo_2k26
```

### 2️⃣ Backend Configuration
```bash
cd backend
npm install
cp .env.example .env
```
Update `.env` with your PostgreSQL database URL and your Google Gemini API Key:
```env
DATABASE_URL="postgresql://..."
GEMINI_API_KEY="AIzaSy..."
```

Generate client, run database migrations, seed, and launch:
```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

### 3️⃣ Frontend Configuration
```bash
cd ../frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) to access the system dashboard!

---

## 👤 Default Credentials
* **Email**: `admin@assetflow.com`
* **Password**: `Admin@123`