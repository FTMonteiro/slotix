import type { ProfessionalBlockDTO, ProfessionalDTO } from "@slotix/types";
import { ConflictError, NotFoundError, ValidationError } from "../../shared/errors";
import { assertBusinessOwner, getBusinessOrThrow } from "../businesses";
import { usersRepository } from "../users";
import { professionalsRepository } from "./professionals.repository";
import type { CreateBlockInput, CreateProfessionalInput, UpdateProfessionalInput } from "./professionals.schema";

function toProfessionalDTO(professional: {
  id: string;
  businessId: string;
  userId: string;
  bio: string | null;
  specialty: string | null;
  imageUrl: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: { name: string };
  appointments: { review: { rating: number } | null }[];
}): ProfessionalDTO {
  const ratings = professional.appointments.map((a) => a.review?.rating).filter((rating): rating is number => rating !== undefined && rating !== null);
  const ratingAvg = ratings.length > 0 ? Math.round((ratings.reduce((sum, r) => sum + r, 0) / ratings.length) * 10) / 10 : null;

  return {
    id: professional.id,
    businessId: professional.businessId,
    userId: professional.userId,
    name: professional.user.name,
    bio: professional.bio,
    specialty: professional.specialty,
    imageUrl: professional.imageUrl,
    ratingAvg,
    ratingCount: ratings.length,
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

function toBlockDTO(block: { id: string; professionalId: string; startAt: Date; endAt: Date; reason: string | null }): ProfessionalBlockDTO {
  return {
    id: block.id,
    professionalId: block.professionalId,
    startAt: block.startAt.toISOString(),
    endAt: block.endAt.toISOString(),
    reason: block.reason,
  };
}

async function assertCanManageBlocks(professional: { businessId: string; userId: string }, requesterId: string): Promise<void> {
  if (professional.userId === requesterId) return;

  const business = await getBusinessOrThrow(professional.businessId);
  assertBusinessOwner(business, requesterId);
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

  async addBlock(professionalId: string, requesterId: string, input: CreateBlockInput): Promise<ProfessionalBlockDTO> {
    const professional = await getProfessionalOrThrow(professionalId);
    await assertCanManageBlocks(professional, requesterId);

    const block = await professionalsRepository.createBlock({
      professionalId,
      startAt: new Date(input.startAt),
      endAt: new Date(input.endAt),
      reason: input.reason,
    });
    return toBlockDTO(block);
  },

  async listBlocks(professionalId: string, requesterId: string): Promise<ProfessionalBlockDTO[]> {
    const professional = await getProfessionalOrThrow(professionalId);
    await assertCanManageBlocks(professional, requesterId);

    const blocks = await professionalsRepository.findBlocksByProfessional(professionalId);
    return blocks.map(toBlockDTO);
  },

  async removeBlock(professionalId: string, blockId: string, requesterId: string): Promise<void> {
    const professional = await getProfessionalOrThrow(professionalId);
    await assertCanManageBlocks(professional, requesterId);

    const block = await professionalsRepository.findBlockById(blockId);
    if (!block || block.professionalId !== professionalId) {
      throw new NotFoundError("Bloqueio não encontrado.", "BLOCK_NOT_FOUND");
    }

    await professionalsRepository.deleteBlock(blockId);
  },
};
