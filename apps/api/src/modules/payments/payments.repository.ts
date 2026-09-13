import { prisma } from "../../config/database";
import type { PaymentMethod, PaymentStatus, Prisma } from "@prisma/client";

export const paymentsRepository = {
  create(data: { appointmentId: string; userId: string; businessId: string; amount: Prisma.Decimal | number; currency: string; method: PaymentMethod }) {
    return prisma.payment.create({ data });
  },

  findById(id: string) {
    return prisma.payment.findUnique({ where: { id } });
  },

  findByAppointmentId(appointmentId: string) {
    return prisma.payment.findUnique({ where: { appointmentId } });
  },

  findByUser(userId: string) {
    return prisma.payment.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  },

  findByBusiness(businessId: string) {
    return prisma.payment.findMany({ where: { businessId }, orderBy: { createdAt: "desc" } });
  },

  updateStatus(id: string, data: { status: PaymentStatus; paidAt?: Date | null }) {
    return prisma.payment.update({ where: { id }, data });
  },
};
