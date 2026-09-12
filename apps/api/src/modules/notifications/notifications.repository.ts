import { prisma } from "../../config/database";

export const notificationsRepository = {
  create(data: { userId: string; type: string; title: string; message: string }) {
    return prisma.notification.create({ data });
  },

  findByUser(userId: string) {
    return prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  },

  findById(id: string) {
    return prisma.notification.findUnique({ where: { id } });
  },

  markRead(id: string) {
    return prisma.notification.update({ where: { id }, data: { read: true } });
  },

  markAllRead(userId: string) {
    return prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
  },
};
