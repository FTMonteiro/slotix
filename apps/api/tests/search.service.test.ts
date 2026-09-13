import { beforeEach, describe, expect, it, vi } from "vitest";

const findCandidates = vi.fn(async () => [] as unknown[]);

vi.mock("../src/modules/search/search.repository", () => ({
  searchRepository: {
    findCandidates: (...args: unknown[]) => findCandidates(...args),
  },
}));

const { searchService } = await import("../src/modules/search/search.service");

function decimal(value: number) {
  return { toNumber: () => value };
}

function makeService(overrides: Record<string, unknown> = {}) {
  return {
    id: "svc-1",
    name: "Corte de Cabelo",
    description: null,
    category: "corte",
    price: decimal(15),
    ...overrides,
  };
}

function makeBusiness(overrides: Record<string, unknown> = {}) {
  return {
    id: "biz-1",
    ownerId: "owner-1",
    name: "Barbearia Monteiro",
    description: null,
    address: null,
    phone: null,
    category: "barbearia",
    imageUrl: null,
    latitude: 38.7223,
    longitude: -9.1393,
    createdAt: new Date(),
    updatedAt: new Date(),
    reviews: [],
    services: [makeService()],
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  findCandidates.mockResolvedValue([]);
});

describe("searchService.search", () => {
  it("rejeita uma pesquisa sem termos válidos", async () => {
    await expect(searchService.search({ q: "a", sortBy: "recommended", page: 1, limit: 20 })).rejects.toMatchObject({
      code: "SEARCH_INVALID_QUERY",
    });
  });

  it("exige localização para ordenar por 'nearest'", async () => {
    await expect(searchService.search({ q: "corte", sortBy: "nearest", page: 1, limit: 20 })).rejects.toMatchObject({
      code: "SEARCH_LOCATION_REQUIRED",
    });
  });

  it("encontra 'Corte de Cabelo' ao pesquisar por 'cortar cabelo' (correspondência por palavra)", async () => {
    findCandidates.mockResolvedValue([makeBusiness()]);

    const { data } = await searchService.search({ q: "cortar cabelo", sortBy: "recommended", page: 1, limit: 20 });

    expect(data).toHaveLength(1);
    expect(data[0].matchedService).toEqual({ id: "svc-1", name: "Corte de Cabelo", price: 15 });
  });

  it("devolve matchedService nulo quando o negócio não tem serviços ativos", async () => {
    findCandidates.mockResolvedValue([makeBusiness({ services: [] })]);

    const { data } = await searchService.search({ q: "barbearia", sortBy: "recommended", page: 1, limit: 20 });

    expect(data[0].matchedService).toBeNull();
  });

  it("calcula a distância quando a localização do utilizador é fornecida", async () => {
    findCandidates.mockResolvedValue([makeBusiness()]);

    const { data } = await searchService.search({
      q: "corte",
      latitude: 38.7223,
      longitude: -9.1393,
      sortBy: "recommended",
      page: 1,
      limit: 20,
    });

    expect(data[0].business.distanceKm).toBeCloseTo(0, 1);
  });

  it("ordena por 'nearest' de forma crescente", async () => {
    findCandidates.mockResolvedValue([
      makeBusiness({ id: "far", latitude: 41.1579, longitude: -8.6291 }), // Porto
      makeBusiness({ id: "near", latitude: 38.7223, longitude: -9.1393 }), // Lisboa
    ]);

    const { data } = await searchService.search({
      q: "corte",
      latitude: 38.7223,
      longitude: -9.1393,
      sortBy: "nearest",
      page: 1,
      limit: 20,
    });

    expect(data.map((r) => r.business.id)).toEqual(["near", "far"]);
  });

  it("ordena por 'bestPrice' de forma crescente pelo preço do serviço correspondente", async () => {
    findCandidates.mockResolvedValue([
      makeBusiness({ id: "expensive", services: [makeService({ id: "svc-a", price: decimal(50) })] }),
      makeBusiness({ id: "cheap", services: [makeService({ id: "svc-b", price: decimal(10) })] }),
    ]);

    const { data } = await searchService.search({ q: "corte", sortBy: "bestPrice", page: 1, limit: 20 });

    expect(data.map((r) => r.business.id)).toEqual(["cheap", "expensive"]);
  });

  it("ordena por 'topRated' considerando o número de avaliações, não só a média", async () => {
    findCandidates.mockResolvedValue([
      makeBusiness({ id: "one-five-star", reviews: [{ rating: 5 }] }),
      makeBusiness({ id: "many-good-reviews", reviews: Array.from({ length: 300 }, () => ({ rating: 4.6 })) }),
    ]);

    const { data } = await searchService.search({ q: "corte", sortBy: "topRated", page: 1, limit: 20 });

    expect(data.map((r) => r.business.id)).toEqual(["many-good-reviews", "one-five-star"]);
  });

  it("pagina os resultados", async () => {
    findCandidates.mockResolvedValue([makeBusiness({ id: "b1" }), makeBusiness({ id: "b2" }), makeBusiness({ id: "b3" })]);

    const { data, meta } = await searchService.search({ q: "corte", sortBy: "recommended", page: 2, limit: 2 });

    expect(data).toHaveLength(1);
    expect(meta).toEqual({ page: 2, limit: 2, total: 3 });
  });
});
