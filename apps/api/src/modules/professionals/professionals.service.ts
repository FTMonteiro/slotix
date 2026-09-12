import type { ProfessionalDTO } from "@slotix/types";
import { ConflictError, NotFoundError, ValidationError } from "../../shared/errors";
import { assertBusinessOwner, getBusinessOrThrow } from "../businesses";
import { usersRepository } from "../users";
import { professionalsRepository } from "./professionals.repository";
import type { CreateProfessionalInput, UpdateProfessionalInput } from "./professionals.schema";

function toProfessionalDTO(professional: {
  id: string;
  businessId: string;
  userId: string;
  bio: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: { name: string };
}): ProfessionalDTO {
  return {
    id: professional.id,
    businessId: professional.businessId,
    userId: professional.userId,
    name: professional.user.name,
    bio: professional.bio,
    active: professional.active,
    createdAt: professional.createdAt.toISOString(),
    updatedAt: professional.updatedAt.toISOString(),
  };
}

export async function getProfessionalOrThrow(id: string) {
  const professional = await professionalsRepository.findById(id);
  if (!professional) throw new NotFoundError("Profissional não encontrado.", "PROFESSIONAL_NOT_FOUND");
  return professional;
}

export const professionalsService = {
  async create(ownerId: string, input: CreateProfessionalInput): Promise<ProfessionalDTO> {
    const business = await getBusinessOrThrow(input.businessId);
    assertBusinessOwner(business, ownerId);

    const user = await usersRepository.findById(input.userId);
    if (!user) throw new NotFoundError("Utilizador não encontrado.", "USER_NOT_FOUND");
    if (user.role !== "EMPLOYEE") {
      throw new ValidationError("O utilizador tem de ter o papel EMPLOYEE.", "USER_NOT_EMPLOYEE");
    }

    const existing = await professionalsRepository.findByUserId(input.userId);
    if (existing) throw new ConflictError("Este utilizador já é profissional noutro negócio.", "PROFESSIONAL_ALREADY_LINKED");

    const professional = await professionalsRepository.create(input);
    return toProfessionalDTO(professional);
  },

  async listByBusiness(businessId: string): Promise<ProfessionalDTO[]> {
    const professionals = await professionalsRepository.findByBusiness(businessId);
    return professionals.map(toProfessionalDTO);
  },

  async getById(id: string): Promise<ProfessionalDTO> {
    const professional = await getProfessionalOrThrow(id);
    return toProfessionalDTO(professional);
  },

  async update(id: string, ownerId: string, input: UpdateProfessionalInput): Promise<ProfessionalDTO> {
    const professional = await getProfessionalOrThrow(id);
    const business = await getBusinessOrThrow(professional.businessId);
    assertBusinessOwner(business, ownerId);

    const updated = await professionalsRepository.update(id, input);
    return toProfessionalDTO(updated);
  },

  async remove(id: string, ownerId: string): Promise<void> {
    const professional = await getProfessionalOrThrow(id);
    const business = await getBusinessOrThrow(professional.businessId);
    assertBusinessOwner(business, ownerId);

    await professionalsRepository.delete(id);
  },
};
