import bcrypt from "bcryptjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

const findUserByEmail = vi.fn();
const findUserById = vi.fn();
const createUser = vi.fn();
const createRefreshToken = vi.fn(async () => ({}));
const findActiveRefreshToken = vi.fn();
const revokeRefreshToken = vi.fn();
const revokeAllUserRefreshTokens = vi.fn();

vi.mock("../src/modules/auth/auth.repository", () => ({
  authRepository: {
    findUserByEmail: (...args: unknown[]) => findUserByEmail(...args),
    findUserById: (...args: unknown[]) => findUserById(...args),
    createUser: (...args: unknown[]) => createUser(...args),
    createRefreshToken: (...args: unknown[]) => createRefreshToken(...args),
    findActiveRefreshToken: (...args: unknown[]) => findActiveRefreshToken(...args),
    revokeRefreshToken: (...args: unknown[]) => revokeRefreshToken(...args),
    revokeAllUserRefreshTokens: (...args: unknown[]) => revokeAllUserRefreshTokens(...args),
  },
}));

const { authService } = await import("../src/modules/auth/auth.service");

const existingUser = {
  id: "user-1",
  email: "existing@slotix.dev",
  name: "Existing User",
  phone: null,
  role: "CUSTOMER" as const,
  passwordHash: await bcrypt.hash("correct-password", 4),
  createdAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("authService.register", () => {
  it("rejeita registo com email já existente", async () => {
    findUserByEmail.mockResolvedValue(existingUser);

    await expect(
      authService.register({ name: "Novo", email: existingUser.email, password: "password123" }),
    ).rejects.toMatchObject({ code: "EMAIL_ALREADY_REGISTERED" });
  });

  it("regista um novo utilizador e emite tokens", async () => {
    findUserByEmail.mockResolvedValue(null);
    createUser.mockResolvedValue({ ...existingUser, id: "user-2", email: "new@slotix.dev" });

    const result = await authService.register({ name: "Novo", email: "new@slotix.dev", password: "password123" });

    expect(result.user.email).toBe("new@slotix.dev");
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
  });
});

describe("authService.login", () => {
  it("rejeita quando o utilizador não existe", async () => {
    findUserByEmail.mockResolvedValue(null);

    await expect(
      authService.login({ email: "unknown@slotix.dev", password: "whatever123" }),
    ).rejects.toMatchObject({ code: "AUTHENTICATION_ERROR" });
  });

  it("rejeita quando a password está errada", async () => {
    findUserByEmail.mockResolvedValue(existingUser);

    await expect(
      authService.login({ email: existingUser.email, password: "wrong-password" }),
    ).rejects.toMatchObject({ code: "AUTHENTICATION_ERROR" });
  });

  it("autentica com credenciais corretas", async () => {
    findUserByEmail.mockResolvedValue(existingUser);

    const result = await authService.login({ email: existingUser.email, password: "correct-password" });

    expect(result.user.id).toBe(existingUser.id);
    expect(result.accessToken).toBeDefined();
  });
});
