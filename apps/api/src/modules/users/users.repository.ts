import { prisma } from "../../config/database";

export const usersRepository = {
  findById(id: string) {
    return prisma.user.findFirst({ where: { id, deletedAt: null } });
  },

  update(id: string, data: { name?: string; phone?: string; avatarUrl?: string }) {
    return prisma.user.update({ where: { id }, data });
  },

  updatePasswordHash(id: string, passwordHash: string) {
    return prisma.user.update({ where: { id }, data: { passwordHash } });
  },

  softDelete(id: string) {
    return prisma.user.update({ where: { id }, data: { deletedAt: new Date() } });
  },

  revokeAllRefreshTokens(userId: string) {
    return prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },
};
