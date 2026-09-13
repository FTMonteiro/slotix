import { beforeEach, describe, expect, it, vi } from "vitest";

const findById = vi.fn();
const softDelete = vi.fn();
const revokeAllRefreshTokens = vi.fn();

vi.mock("../src/modules/users/users.repository", () => ({
  usersRepository: {
    findById: (...args: unknown[]) => findById(...args),
    softDelete: (...args: unknown[]) => softDelete(...args),
    revokeAllRefreshTokens: (...args: unknown[]) => revokeAllRefreshTokens(...args),
  },
}));

const { usersService } = await import("../src/modules/users/users.service");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("usersService.deleteAccount", () => {
  it("rejeita apagar um utilizador que não existe (ou já apagado)", async () => {
    findById.mockResolvedValue(null);

    await expect(usersService.deleteAccount("user-1")).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(softDelete).not.toHaveBeenCalled();
  });

  it("marca o utilizador como apagado e revoga os refresh tokens", async () => {
    findById.mockResolvedValue({ id: "user-1" });

    await usersService.deleteAccount("user-1");

    expect(softDelete).toHaveBeenCalledWith("user-1");
    expect(revokeAllRefreshTokens).toHaveBeenCalledWith("user-1");
  });
});
