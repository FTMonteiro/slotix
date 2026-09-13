import type { BusinessDTO, BusinessHoursEntryDTO, PaginationMeta } from "@slotix/types";
import { AuthorizationError, NotFoundError } from "../../shared/errors";
import { haversineDistanceKm } from "../../shared/utils/geo";
import { businessesRepository } from "./businesses.repository";
import type { CreateBusinessInput, ListBusinessesQuery, SetBusinessHoursInput, UpdateBusinessInput } from "./businesses.schema";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

function ratingOf(reviews: { rating: number }[]): { ratingAvg: number | null; ratingCount: number } {
  if (reviews.length === 0) return { ratingAvg: null, ratingCount: 0 };
  const avg = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  return { ratingAvg: Math.round(avg * 10) / 10, ratingCount: reviews.length };
}

// viewerCoords is optional and only ever comes from an explicit lat/lng on the request —
// existing callers (favorites, reviews, etc.) that don't pass it keep getting
// distanceKm: null, unchanged from before this field existed.
export function toBusinessDTO(
  business: {
    id: string;
    ownerId: string;
    name: string;
    description: string | null;
    address: string | null;
    phone: string | null;
    category: string | null;
    imageUrl: string | null;
    latitude: number | null;
    longitude: number | null;
    createdAt: Date;
    updatedAt: Date;
    reviews?: { rating: number }[];
  },
  viewerCoords?: Coordinates,
): BusinessDTO {
  const { ratingAvg, ratingCount } = ratingOf(business.reviews ?? []);
  const distanceKm =
    viewerCoords && business.latitude !== null && business.longitude !== null
      ? Math.round(haversineDistanceKm(viewerCoords.latitude, viewerCoords.longitude, business.latitude, business.longitude) * 10) / 10
      : null;

  return {
    id: business.id,
    ownerId: business.ownerId,
    name: business.name,
    description: business.description,
    address: business.address,
    phone: business.phone,
    category: business.category,
    imageUrl: business.imageUrl,
    latitude: business.latitude,
    longitude: business.longitude,
    ratingAvg,
    ratingCount,
    distanceKm,
    createdAt: business.createdAt.toISOString(),
    updatedAt: business.updatedAt.toISOString(),
  };
}

export async function getBusinessOrThrow(businessId: string) {
  const business = await businessesRepository.findById(businessId);
  if (!business) throw new NotFoundError("Negócio não encontrado.", "BUSINESS_NOT_FOUND");
  return business;
}

export function assertBusinessOwner(business: { ownerId: string }, userId: string): void {
  if (business.ownerId !== userId) {
    throw new AuthorizationError("Não é o proprietário deste negócio.");
  }
}

export const businessesService = {
  async create(ownerId: string, input: CreateBusinessInput): Promise<BusinessDTO> {
    const business = await businessesRepository.create({ ownerId, ...input });
    return toBusinessDTO(business);
  },

  async list(query: ListBusinessesQuery): Promise<{ data: BusinessDTO[]; meta: PaginationMeta }> {
    const businesses = await businessesRepository.findManyFiltered({
      category: query.category,
      search: query.search,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
    });

    const viewerCoords = query.latitude !== undefined && query.longitude !== undefined ? { latitude: query.latitude, longitude: query.longitude } : undefined;
    const dtos = businesses.map((business) => toBusinessDTO(business, viewerCoords));

    let filtered = query.minRating !== undefined ? dtos.filter((dto) => (dto.ratingAvg ?? 0) >= query.minRating!) : dtos;
    // radiusKm only means anything alongside coordinates; a business without its own
    // lat/lng (distanceKm: null) can't be judged against a radius, so it's kept rather
    // than silently dropped.
    if (query.radiusKm !== undefined && viewerCoords) {
      filtered = filtered.filter((dto) => dto.distanceKm === null || dto.distanceKm <= query.radiusKm!);
    }

    const total = filtered.length;
    const start = (query.page - 1) * query.limit;
    const page = filtered.slice(start, start + query.limit);

    return { data: page, meta: { page: query.page, limit: query.limit, total } };
  },

  async getById(id: string): Promise<BusinessDTO> {
    const business = await getBusinessOrThrow(id);
    return toBusinessDTO(business);
  },

  async update(id: string, ownerId: string, input: UpdateBusinessInput): Promise<BusinessDTO> {
    const business = await getBusinessOrThrow(id);
    assertBusinessOwner(business, ownerId);
    const updated = await businessesRepository.update(id, input);
    return toBusinessDTO(updated);
  },

  async remove(id: string, ownerId: string): Promise<void> {
    const business = await getBusinessOrThrow(id);
    assertBusinessOwner(business, ownerId);
    await businessesRepository.delete(id);
  },

  async getHours(businessId: string): Promise<BusinessHoursEntryDTO[]> {
    await getBusinessOrThrow(businessId);
    const hours = await businessesRepository.findHours(businessId);
    return hours.map((h) => ({ dayOfWeek: h.dayOfWeek, startMinute: h.startMinute, endMinute: h.endMinute }));
  },

  async setHours(businessId: string, ownerId: string, input: SetBusinessHoursInput): Promise<BusinessHoursEntryDTO[]> {
    const business = await getBusinessOrThrow(businessId);
    assertBusinessOwner(business, ownerId);

    await businessesRepository.setHours(businessId, input.hours);
    return businessesService.getHours(businessId);
  },
};
