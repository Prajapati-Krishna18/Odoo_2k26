# Authentication & Authorization Flow

## Overview

AssetFlow uses a Role-Based Access Control (RBAC) system with JWT-based authentication. This document explains the complete authentication flow, role management, and admin bootstrap mechanism.

---

## Roles

The system includes the following roles:

| Role | Description |
|------|-------------|
| **ADMIN** | Full system access, can manage users and roles |
| **EMPLOYEE** | Standard user access, can view assigned assets |
| **ASSET_MANAGER** | Can manage assets, categories, and allocations |
| **IT_MANAGER** | Can manage IT-related assets and configurations |
| **AUDITOR** | Read-only access for audit and reporting purposes |

---

## Registration Flow

### Public Registration

All public registrations create users with the **EMPLOYEE** role by default.

```
POST /api/auth/register
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "uuid",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "EMPLOYEE",
    ...
  }
}
```

### Admin Bootstrap (First User Promotion)

When the database has **zero ADMIN users**, the **first registered user** is automatically promoted to **ADMIN** role.

**Conditions:**
- No ADMIN users exist in the database
- First user registration triggers automatic promotion
- Happens only once - subsequent registrations remain EMPLOYEE

**Console Log:**
```
🎉  First user registered - automatically promoted to ADMIN: user@example.com
```

---

## Login Flow

```
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "ADMIN"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
}
```

---

## Token Usage

### Access Token

- Used in `Authorization: Bearer <token>` header
- Short-lived (default: 15 minutes)
- Required for authenticated routes

### Refresh Token

- Used to obtain new access tokens
- Long-lived (default: 7 days)
- Stored in database for revocation support

**Refresh Flow:**
```
POST /api/auth/refresh-token
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## Role Management (Admin Only)

### Update User Role

Admins can update any user's role using the PATCH endpoint.

```
PATCH /api/auth/users/:id/role
Authorization: Bearer <admin_access_token>
{
  "role": "ASSET_MANAGER"
}
```

**Available Roles:** `ADMIN`, `EMPLOYEE`, `ASSET_MANAGER`, `IT_MANAGER`, `AUDITOR`

**Response:**
```json
{
  "success": true,
  "message": "User role updated successfully",
  "data": {
    "id": "uuid",
    "fullName": "John Doe",
    "role": "ASSET_MANAGER"
  }
}
```

**Safety Features:**
- Validates role existence before update
- Prevents self-demotion from ADMIN role
- Returns clear error messages for invalid operations

---

## Authorization Middleware

Protected routes use the `authorize()` middleware to enforce role-based access.

```typescript
// Single role requirement
router.get("/admin-only", authenticate, authorize("ADMIN"), handler);

// Multiple role requirement
router.get("/managers", authenticate, authorize("ADMIN", "ASSET_MANAGER"), handler);
```

**Error Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Requires ADMIN role. Your current role: EMPLOYEE",
  "statusCode": 403
}
```

---

## Database Seeding

### Automatic Seeding

Default roles are automatically seeded on application startup:

```typescript
// src/server.ts
await seedDefaultRoles();
```

This ensures required roles exist before the server accepts requests.

### Manual Seeding

Run the seed script manually:

```bash
npm run seed
```

Or via Prisma:

```bash
npx prisma db seed
```

**Seeded Roles:**
- ADMIN
- EMPLOYEE
- ASSET_MANAGER
- IT_MANAGER
- AUDITOR

The seed script is **idempotent** - safe to run multiple times without creating duplicates.

---

## Complete Auth Flow Diagram

```
┌─────────────────┐
│  Registration   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Check if ADMIN  │──── No ────┐
│   exists?       │             │
└────────┬────────┘             │
         │ Yes                  │
         ▼                      │
┌─────────────────┐             │
│ Assign EMPLOYEE  │             │
└────────┬────────┘             │
         │                      │
         │                      │ No
         │                      │
         │                      ▼
         │              ┌─────────────────┐
         │              │ Assign ADMIN    │
         │              │ (Bootstrap)     │
         │              └─────────────────┘
         │                      │
         └──────────┬───────────┘
                    │
                    ▼
         ┌─────────────────┐
         │  Create User    │
         └─────────────────┘
```

---

## Security Considerations

1. **Password Hashing**: All passwords are hashed using bcrypt (12 rounds)
2. **JWT Signing**: Tokens are signed using a secret_key from environment variables
3. **Token Expiry**: Access tokens expire quickly; refresh tokens are stored for revocation
4. **Role Validation**: All role changes validate role existence
5. **Self-Demotion Protection**: Admins cannot demote themselves
6. **Account Status**: Deactivated accounts cannot authenticate

---

## Environment Variables

Required environment variables for authentication:

```env
JWT_SECRET=your-secret-key
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
DATABASE_URL=postgresql://...
```

---

## Common Error Messages

| Error | Message | Solution |
|-------|---------|----------|
| 401 | Access token is missing | Include `Authorization: Bearer <token>` header |
| 401 | Access token has expired | Use refresh token to get new access token |
| 403 | Requires ADMIN role. Your current role: EMPLOYEE | Contact admin for role upgrade |
| 409 | Email already exists | Use different email address |
| 400 | Role 'INVALID' does not exist | Use valid role name |

---

## Testing the Auth Flow

### 1. Register First User (Becomes Admin)

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Admin User",
    "email": "admin@example.com",
    "password": "Admin@123",
    "phone": "+1234567890"
  }'
```

### 2. Login as Admin

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin@123"
  }'
```

### 3. Update User Role

```bash
curl -X PATCH http://localhost:5000/api/auth/users/{user_id}/role \
  -H "Authorization: Bearer <admin_access_token>" \
  -H "Content-Type: application/json" \
  -d '{"role": "ASSET_MANAGER"}'
```

---

## Backward Compatibility

All existing authentication flows remain unchanged:
- JWT implementation unchanged
- Password hashing unchanged
- Refresh token logic unchanged
- Login/logout unchanged
- Token refresh unchanged

Only the registration flow and role management have been enhanced.
