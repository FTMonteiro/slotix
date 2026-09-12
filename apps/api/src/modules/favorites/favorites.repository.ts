import { prisma } from "../../config/database";

export const favoritesRepository = {
  findByUserAndBusiness(userId: string, businessId: string) {
    return prisma.favorite.findUnique({ where: { userId_businessId: { userId, businessId } } });
  },

  create(userId: string, businessId: string) {
    return prisma.favorite.create({ data: { userId, businessId }, include: { business: true } });
  },

  findByUser(userId: string) {
    return prisma.favorite.findMany({
      where: { userId },
      include: { business: true },
      orderBy: { createdAt: "desc" },
    });
  },

  delete(id: string) {
    return prisma.favorite.delete({ where: { id } });
  },
};
