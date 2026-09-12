import type { BusinessDTO } from "@slotix/types";
import { AuthorizationError, NotFoundError } from "../../shared/errors";
import { businessesRepository } from "./businesses.repository";
import type { CreateBusinessInput, UpdateBusinessInput } from "./businesses.schema";

export function toBusinessDTO(business: {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
}): BusinessDTO {
  return {
    id: business.id,
    ownerId: business.ownerId,
    name: business.name,
    description: business.description,
    address: business.address,
    phone: business.phone,
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

  async list(): Promise<BusinessDTO[]> {
    const businesses = await businessesRepository.findMany();
    return businesses.map(toBusinessDTO);
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
};
