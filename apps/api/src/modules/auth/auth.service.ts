import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import ms from "../../shared/utils/ms";
import type { LoginInput, RegisterInput } from "@slotix/validation";
import type { AuthTokensDTO, LoginResponse, UserDTO } from "@slotix/types";
import { env } from "../../config/env";
import { AuthenticationError, ConflictError } from "../../shared/errors";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../shared/utils/jwt";
import { authRepository } from "./auth.repository";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function toUserDTO(user: { id: string; email: string; name: string; phone: string | null; role: UserDTO["role"]; createdAt: Date }): UserDTO {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  };
}

async function issueTokens(user: { id: string; role: UserDTO["role"] }): Promise<AuthTokensDTO> {
  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const refreshToken = signRefreshToken({ sub: user.id, role: user.role });

  await authRepository.createRefreshToken({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + ms(env.JWT_REFRESH_EXPIRES_IN)),
  });

  return { accessToken, refreshToken };
}

export const authService = {
  async register(input: RegisterInput): Promise<LoginResponse> {
    const existing = await authRepository.findUserByEmail(input.email);
    if (existing) {
      throw new ConflictError("Este email já está registado.", "EMAIL_ALREADY_REGISTERED");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await authRepository.createUser({
      name: input.name,
      email: input.email,
      passwordHash,
      phone: input.phone,
    });

    const tokens = await issueTokens(user);
    return { ...tokens, user: toUserDTO(user) };
  },

  async login(input: LoginInput): Promise<LoginResponse> {
    const user = await authRepository.findUserByEmail(input.email);
    if (!user) {
      throw new AuthenticationError();
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new AuthenticationError();
    }

    const tokens = await issueTokens(user);
    return { ...tokens, user: toUserDTO(user) };
  },

  async refresh(refreshToken: string): Promise<AuthTokensDTO> {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new AuthenticationError("Refresh token inválido ou expirado.");
    }

    const stored = await authRepository.findActiveRefreshToken(hashToken(refreshToken));
    if (!stored) {
      throw new AuthenticationError("Refresh token inválido, expirado ou revogado.");
    }

    const user = await authRepository.findUserById(payload.sub);
    if (!user) {
      throw new AuthenticationError();
    }

    await authRepository.revokeRefreshToken(stored.id);
    return issueTokens(user);
  },

  async logout(userId: string): Promise<void> {
    await authRepository.revokeAllUserRefreshTokens(userId);
  },
};
