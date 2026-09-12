import { prisma } from "../../config/database";

export const professionalsRepository = {
  create(data: { businessId: string; userId: string; bio?: string }) {
    return prisma.professional.create({ data, include: { user: true } });
  },

  findByBusiness(businessId: string) {
    return prisma.professional.findMany({ where: { businessId }, include: { user: true }, orderBy: { createdAt: "desc" } });
  },

  findById(id: string) {
    return prisma.professional.findUnique({ where: { id }, include: { user: true } });
  },

  findByUserId(userId: string) {
    return prisma.professional.findUnique({ where: { userId } });
  },

  update(id: string, data: { bio?: string; active?: boolean }) {
    return prisma.professional.update({ where: { id }, data, include: { user: true } });
  },

  delete(id: string) {
    return prisma.professional.delete({ where: { id } });
  },
};
