/**
 * @file    auth.dto.ts
 * @desc    Data Transfer Objects for the authentication module.
 *          Defines clean structural contracts for request/response payloads.
 */

// ── Request DTOs ─────────────────────────────────────────────

export interface RegisterDTO {
  fullName: string;
  email: string;
  password: string;
  phone: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RefreshTokenDTO {
  refreshToken: string;
}

// ── Response DTOs ────────────────────────────────────────────

export interface UserResponseDTO {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  profileImage: string | null;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLogin: Date | null;
  createdAt: Date;
}

export interface AuthTokensDTO {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponseDTO {
  user: UserResponseDTO;
  tokens: AuthTokensDTO;
}
