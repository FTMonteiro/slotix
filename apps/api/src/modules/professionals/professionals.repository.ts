import { prisma } from "../../config/database";

const includeForDTO = {
  user: true,
  appointments: { select: { review: { select: { rating: true } } } },
} as const;

export const professionalsRepository = {
  create(data: { businessId: string; userId: string; bio?: string; specialty?: string; imageUrl?: string }) {
    return prisma.professional.create({ data, include: includeForDTO });
  },

  findByBusiness(businessId: string) {
    return prisma.professional.findMany({ where: { businessId }, include: includeForDTO, orderBy: { createdAt: "desc" } });
  },

  findById(id: string) {
    return prisma.professional.findUnique({ where: { id }, include: includeForDTO });
  },

  findByUserId(userId: string) {
    return prisma.professional.findUnique({ where: { userId } });
  },

  update(id: string, data: { bio?: string; specialty?: string; imageUrl?: string; active?: boolean }) {
    return prisma.professional.update({ where: { id }, data, include: includeForDTO });
  },

  delete(id: string) {
    return prisma.professional.delete({ where: { id } });
  },

  createBlock(data: { professionalId: string; startAt: Date; endAt: Date; reason?: string }) {
    return prisma.professionalBlock.create({ data });
  },

  findBlocksByProfessional(professionalId: string) {
    return prisma.professionalBlock.findMany({ where: { professionalId }, orderBy: { startAt: "asc" } });
  },

  findBlocksInRange(professionalId: string, rangeStart: Date, rangeEnd: Date) {
    return prisma.professionalBlock.findMany({
      where: { professionalId, startAt: { lt: rangeEnd }, endAt: { gt: rangeStart } },
    });
  },

  findBlockById(id: string) {
    return prisma.professionalBlock.findUnique({ where: { id } });
  },

  deleteBlock(id: string) {
    return prisma.professionalBlock.delete({ where: { id } });
  },
};
