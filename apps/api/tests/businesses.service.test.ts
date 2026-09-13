import { beforeEach, describe, expect, it, vi } from "vitest";

const findManyFiltered = vi.fn();

vi.mock("../src/modules/businesses/businesses.repository", () => ({
  businessesRepository: {
    findManyFiltered: (...args: unknown[]) => findManyFiltered(...args),
  },
}));

const { businessesService } = await import("../src/modules/businesses/businesses.service");

function makeBusiness(id: string, ratings: number[]) {
  return {
    id,
    ownerId: "owner-1",
    name: `Business ${id}`,
    description: null,
    address: null,
    phone: null,
    category: "barbearia",
    imageUrl: null,
    latitude: null,
    longitude: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    reviews: ratings.map((rating) => ({ rating })),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("businessesService.list", () => {
  it("calcula ratingAvg e ratingCount a partir das reviews", async () => {
    findManyFiltered.mockResolvedValue([makeBusiness("b1", [4, 5])]);

    const { data } = await businessesService.list({ page: 1, limit: 20 });

    expect(data[0].ratingAvg).toBe(4.5);
    expect(data[0].ratingCount).toBe(2);
  });

  it("filtra por rating mínimo depois de calcular a média", async () => {
    findManyFiltered.mockResolvedValue([makeBusiness("low", [2]), makeBusiness("high", [5, 5])]);

    const { data, meta } = await businessesService.list({ page: 1, limit: 20, minRating: 4 });

    expect(data.map((b) => b.id)).toEqual(["high"]);
    expect(meta.total).toBe(1);
  });

  it("pagina os resultados já filtrados", async () => {
    findManyFiltered.mockResolvedValue([makeBusiness("b1", []), makeBusiness("b2", []), makeBusiness("b3", [])]);

    const { data, meta } = await businessesService.list({ page: 2, limit: 2 });

    expect(data.map((b) => b.id)).toEqual(["b3"]);
    expect(meta).toEqual({ page: 2, limit: 2, total: 3 });
  });

  it("um negócio sem reviews devolve ratingAvg nulo", async () => {
    findManyFiltered.mockResolvedValue([makeBusiness("b1", [])]);

    const { data } = await businessesService.list({ page: 1, limit: 20 });

    expect(data[0].ratingAvg).toBeNull();
    expect(data[0].ratingCount).toBe(0);
  });
});
