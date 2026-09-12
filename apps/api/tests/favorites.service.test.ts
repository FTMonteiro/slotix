import { beforeEach, describe, expect, it, vi } from "vitest";

const businessMock = { id: "biz-1", ownerId: "owner-1" };

const getBusinessOrThrow = vi.fn(async () => businessMock);
const findByUserAndBusiness = vi.fn(async () => null as unknown);
const create = vi.fn();
const deleteFavorite = vi.fn();

vi.mock("../src/modules/businesses", () => ({
  getBusinessOrThrow: (...args: unknown[]) => getBusinessOrThrow(...args),
  toBusinessDTO: (business: typeof businessMock) => business,
}));

vi.mock("../src/modules/favorites/favorites.repository", () => ({
  favoritesRepository: {
    findByUserAndBusiness: (...args: unknown[]) => findByUserAndBusiness(...args),
    create: (...args: unknown[]) => create(...args),
    delete: (...args: unknown[]) => deleteFavorite(...args),
  },
}));

const { favoritesService } = await import("../src/modules/favorites/favorites.service");

beforeEach(() => {
  vi.clearAllMocks();
  getBusinessOrThrow.mockResolvedValue(businessMock);
  findByUserAndBusiness.mockResolvedValue(null);
});

describe("favoritesService.add", () => {
  it("adiciona um negócio aos favoritos", async () => {
    create.mockResolvedValue({ id: "fav-1", businessId: "biz-1", createdAt: new Date(), business: businessMock });

    const result = await favoritesService.add("user-1", "biz-1");
    expect(result.businessId).toBe("biz-1");
  });

  it("rejeita duplicar um favorito já existente", async () => {
    findByUserAndBusiness.mockResolvedValue({ id: "fav-existing" });

    await expect(favoritesService.add("user-1", "biz-1")).rejects.toMatchObject({
      code: "FAVORITE_ALREADY_EXISTS",
    });
  });
});

describe("favoritesService.remove", () => {
  it("rejeita remover um favorito que não existe", async () => {
    findByUserAndBusiness.mockResolvedValue(null);

    await expect(favoritesService.remove("user-1", "biz-1")).rejects.toMatchObject({
      code: "FAVORITE_NOT_FOUND",
    });
  });

  it("remove um favorito existente", async () => {
    findByUserAndBusiness.mockResolvedValue({ id: "fav-1" });

    await favoritesService.remove("user-1", "biz-1");
    expect(deleteFavorite).toHaveBeenCalledWith("fav-1");
  });
});
