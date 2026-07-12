/**
 * @file    auth.service.ts
 * @desc    Business logic for authentication operations.
 *
 *          register     — Create an Employee account with hashed password.
 *          login        — Verify credentials, issue token pair, record refresh token.
 *          refreshToken — Validate stored refresh token and issue a new access token.
 *          logout       — Remove the refresh token from the database.
 *          getMe        — Return the currently authenticated user's profile.
 */

import { ApiError } from "../../utils/ApiError.js";
import { hashPassword, comparePassword } from "../../utils/bcrypt.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  type JwtPayload,
} from "../../utils/jwt.js";
import * as authRepo from "./auth.repository.js";
import { ActivityLogger } from "../activity/activity.service.js";
import type {
  RegisterDTO,
  LoginDTO,
  UserResponseDTO,
  LoginResponseDTO,
} from "./auth.dto.js";

// ── Helpers ──────────────────────────────────────────────────

/** Strip sensitive fields from a User + Role query result. */
function toUserResponse(user: {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  profileImage: string | null;
  isActive: boolean;
  emailVerified: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  role: { name: string };
}): UserResponseDTO {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    profileImage: user.profileImage,
    role: user.role.name,
    isActive: user.isActive,
    emailVerified: user.emailVerified,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
  };
}

/** Calculate the refresh token expiry date from the JWT_REFRESH_EXPIRES string. */
function getRefreshTokenExpiry(): Date {
  // Support formats like "7d", "24h", "60m"
  const raw = process.env["JWT_REFRESH_EXPIRES"] ?? "7d";
  const match = raw.match(/^(\d+)([dhm])$/);

  if (!match) {
    // Default to 7 days if format is unrecognised
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  const value = parseInt(match[1]!, 10);
  const unit = match[2]!;

  const ms: Record<string, number> = {
    d: 24 * 60 * 60 * 1000,
    h: 60 * 60 * 1000,
    m: 60 * 1000,
  };

  return new Date(Date.now() + value * (ms[unit] ?? 24 * 60 * 60 * 1000));
}

// ────────────────────────────────────────────────────────────
// register
// ────────────────────────────────────────────────────────────

export async function register(dto: RegisterDTO): Promise<UserResponseDTO> {
  // 1. Check if email is already taken
  const existing = await authRepo.findUserByEmail(dto.email);
  if (existing) {
    throw ApiError.conflict("Email already exists");
  }

  // 2. Resolve the EMPLOYEE role (default for all signups)
  const employeeRole = await authRepo.findRoleByName("EMPLOYEE");
  if (!employeeRole) {
    throw ApiError.internal("Default role not found. Please run database seed.");
  }

  // 3. Hash the password
  const hashedPassword = await hashPassword(dto.password);

  // 4. Create the user
  const user = await authRepo.createUser({
    fullName: dto.fullName,
    email: dto.email,
    password: hashedPassword,
    phone: dto.phone,
    roleId: employeeRole.id,
  });

  return toUserResponse(user);
}

// ────────────────────────────────────────────────────────────
// login
// ────────────────────────────────────────────────────────────

export async function login(dto: LoginDTO): Promise<LoginResponseDTO> {
  // 1. Find user by email
  const user = await authRepo.findUserByEmail(dto.email);
  if (!user) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  // 2. Check account status
  if (!user.isActive) {
    throw ApiError.forbidden("Account is deactivated. Contact an administrator.");
  }

  // 3. Compare passwords
  const isMatch = await comparePassword(dto.password, user.password);
  if (!isMatch) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  // 4. Build JWT payload
  const payload: JwtPayload = {
    id: user.id,
    email: user.email,
    role: user.role.name,
  };

  // 5. Generate tokens
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // 6. Store refresh token in database
  await authRepo.createRefreshToken({
    token: refreshToken,
    userId: user.id,
    expiresAt: getRefreshTokenExpiry(),
  });

  // 7. Update last login
  await authRepo.updateUserLastLogin(user.id);

  return {
    user: toUserResponse(user),
    tokens: {
      accessToken,
      refreshToken,
    },
  };
}

// ────────────────────────────────────────────────────────────
// refreshToken
// ────────────────────────────────────────────────────────────

export async function refreshAccessToken(
  token: string
): Promise<{ accessToken: string }> {
  // 1. Check if the token exists in DB
  const storedToken = await authRepo.findRefreshToken(token);
  if (!storedToken) {
    throw ApiError.unauthorized("Invalid refresh token");
  }

  // 2. Check expiry
  if (new Date() > storedToken.expiresAt) {
    await authRepo.deleteRefreshToken(token);
    throw ApiError.unauthorized("Refresh token has expired");
  }

  // 3. Verify the JWT signature
  let decoded: JwtPayload;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    await authRepo.deleteRefreshToken(token);
    throw ApiError.unauthorized("Invalid refresh token");
  }

  // 4. Verify user still exists and is active
  const user = await authRepo.findUserById(decoded.id);
  if (!user || !user.isActive) {
    await authRepo.deleteRefreshToken(token);
    throw ApiError.unauthorized("User not found or account is deactivated");
  }

  // 5. Issue a new access token
  const payload: JwtPayload = {
    id: user.id,
    email: user.email,
    role: user.role.name,
  };

  const accessToken = generateAccessToken(payload);

  return { accessToken };
}

// ────────────────────────────────────────────────────────────
// logout
// ────────────────────────────────────────────────────────────

export async function logout(refreshToken: string): Promise<void> {
  const existing = await authRepo.findRefreshToken(refreshToken);
  if (existing) {
    // Log logout activity in the background
    ActivityLogger.log(
      existing.userId,
      "LOGOUT",
      "AUTH",
      existing.userId,
      "User logged out successfully"
    );
    await authRepo.deleteRefreshToken(refreshToken);
  }
}

// ────────────────────────────────────────────────────────────
// getMe
// ────────────────────────────────────────────────────────────

export async function getMe(userId: string): Promise<UserResponseDTO> {
  const user = await authRepo.findUserById(userId);
  if (!user) {
    throw ApiError.notFound("User not found");
  }

  if (!user.isActive) {
    throw ApiError.forbidden("Account is deactivated");
  }

  return toUserResponse(user);
}
