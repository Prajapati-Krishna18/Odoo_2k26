/**
 * @file    auth.repository.ts
 * @desc    Data-access layer for User, Role, and RefreshToken entities.
 *          All direct Prisma queries live here — the service layer never
 *          touches the ORM directly.
 */

import { prisma } from "../../config/prisma.js";

// ────────────────────────────────────────────────────────────
// Role queries
// ────────────────────────────────────────────────────────────

export const findRoleByName = (name: string) =>
  prisma.role.findUnique({ where: { name } });

// ────────────────────────────────────────────────────────────
// User queries
// ────────────────────────────────────────────────────────────

export const findUserByEmail = (email: string) =>
  prisma.user.findUnique({
    where: { email },
    include: { role: true },
  });

export const findUserById = (id: string) =>
  prisma.user.findUnique({
    where: { id },
    include: { role: true },
  });

export const createUser = (data: {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  roleId: string;
}) =>
  prisma.user.create({
    data,
    include: { role: true },
  });

export const updateUserLastLogin = (id: string) =>
  prisma.user.update({
    where: { id },
    data: { lastLogin: new Date() },
  });

// ────────────────────────────────────────────────────────────
// Refresh Token queries
// ────────────────────────────────────────────────────────────

export const createRefreshToken = (data: {
  token: string;
  userId: string;
  expiresAt: Date;
}) => prisma.refreshToken.create({ data });

export const findRefreshToken = (token: string) =>
  prisma.refreshToken.findUnique({ where: { token } });

export const deleteRefreshToken = (token: string) =>
  prisma.refreshToken.delete({ where: { token } });

export const deleteAllUserRefreshTokens = (userId: string) =>
  prisma.refreshToken.deleteMany({ where: { userId } });
