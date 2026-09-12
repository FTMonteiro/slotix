import { prisma } from "../../config/database";

export const usersRepository = {
  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  update(id: string, data: { name?: string; phone?: string }) {
    return prisma.user.update({ where: { id }, data });
  },

  updatePasswordHash(id: string, passwordHash: string) {
    return prisma.user.update({ where: { id }, data: { passwordHash } });
  },
};
