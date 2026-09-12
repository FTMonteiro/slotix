import { prisma } from "../../config/database";

export const clientsRepository = {
  async findCompletedAppointmentsByBusiness(businessId: string) {
    return prisma.appointment.findMany({
      where: { businessId, status: "COMPLETED" },
      include: { client: true },
      orderBy: { scheduledAt: "desc" },
    });
  },

  async findCompletedAppointmentsForClient(businessId: string, clientId: string) {
    return prisma.appointment.findMany({
      where: { businessId, clientId, status: "COMPLETED" },
      include: { client: true },
      orderBy: { scheduledAt: "desc" },
    });
  },
};
