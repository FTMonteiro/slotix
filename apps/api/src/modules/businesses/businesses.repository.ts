import { prisma } from "../../config/database";

export const businessesRepository = {
  create(data: { ownerId: string; name: string; description?: string; address?: string; phone?: string }) {
    return prisma.business.create({ data });
  },

  findMany() {
    return prisma.business.findMany({ orderBy: { createdAt: "desc" } });
  },

  findById(id: string) {
    return prisma.business.findUnique({ where: { id } });
  },

  update(id: string, data: { name?: string; description?: string; address?: string; phone?: string }) {
    return prisma.business.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.business.delete({ where: { id } });
  },
};
