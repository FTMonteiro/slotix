import type { PaymentDTO } from "@slotix/types";
import type { CreatePaymentInput } from "@slotix/validation";
import { AuthorizationError, ConflictError, NotFoundError, ValidationError } from "../../shared/errors";
import { domainEvents } from "../../shared/events/domainEvents";
import { DEFAULT_CURRENCY } from "../../shared/constants";
import { getAppointmentOrThrow } from "../appointments";
import { getBusinessOrThrow } from "../businesses";
import { paymentsRepository } from "./payments.repository";

type RequesterRole = "CUSTOMER" | "OWNER" | "EMPLOYEE" | "ADMIN";

function toPaymentDTO(payment: {
  id: string;
  appointmentId: string;
  userId: string;
  businessId: string;
  amount: { toNumber(): number };
  currency: string;
  method: PaymentDTO["method"];
  status: PaymentDTO["status"];
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): PaymentDTO {
  return {
    id: payment.id,
    appointmentId: payment.appointmentId,
    userId: payment.userId,
    businessId: payment.businessId,
    amount: payment.amount.toNumber(),
    currency: payment.currency,
    method: payment.method,
    status: payment.status,
    paidAt: payment.paidAt?.toISOString() ?? null,
    createdAt: payment.createdAt.toISOString(),
    updatedAt: payment.updatedAt.toISOString(),
  };
}

async function getPaymentOrThrow(id: string) {
  const payment = await paymentsRepository.findById(id);
  if (!payment) throw new NotFoundError("Pagamento não encontrado.", "PAYMENT_NOT_FOUND");
  return payment;
}

// The payer (the appointment's client), the business's owner, or an admin — never anyone
// else. Reused by every read/transition below so the rule can't drift between them.
async function assertCanAccess(payment: { userId: string; businessId: string }, requesterId: string, requesterRole: RequesterRole): Promise<void> {
  if (requesterRole === "ADMIN") return;
  if (payment.userId === requesterId) return;

  if (requesterRole === "OWNER") {
    const business = await getBusinessOrThrow(payment.businessId);
    if (business.ownerId === requesterId) return;
  }

  throw new AuthorizationError("Não tem permissão para aceder a este pagamento.", "PAYMENT_NOT_AUTHORIZED");
}

// Only the business side confirms/fails/refunds money changing hands — the payer
// (CUSTOMER) can create and view their own payment, but can't mark it paid themselves.
async function assertCanManage(payment: { businessId: string }, requesterId: string, requesterRole: RequesterRole): Promise<void> {
  if (requesterRole === "ADMIN") return;

  if (requesterRole === "OWNER") {
    const business = await getBusinessOrThrow(payment.businessId);
    if (business.ownerId === requesterId) return;
  }

  throw new AuthorizationError("Não tem permissão para gerir este pagamento.", "PAYMENT_NOT_AUTHORIZED");
}

export const paymentsService = {
  async create(requesterId: string, requesterRole: RequesterRole, input: CreatePaymentInput): Promise<PaymentDTO> {
    const appointment = await getAppointmentOrThrow(input.appointmentId);

    if (requesterRole !== "ADMIN" && appointment.clientId !== requesterId) {
      throw new AuthorizationError("Só pode pagar os seus próprios agendamentos.", "PAYMENT_NOT_AUTHORIZED");
    }
    if (appointment.status === "CANCELLED") {
      throw new ValidationError("Não é possível pagar um agendamento cancelado.", "PAYMENT_APPOINTMENT_CANCELLED");
    }

    const existing = await paymentsRepository.findByAppointmentId(input.appointmentId);
    if (existing) {
      throw new ConflictError("Este agendamento já tem um pagamento associado.", "PAYMENT_ALREADY_EXISTS");
    }

    // amount/currency/userId/businessId always come from the appointment, never the
    // request body — the mobile app cannot influence what gets charged.
    const payment = await paymentsRepository.create({
      appointmentId: appointment.id,
      userId: appointment.clientId,
      businessId: appointment.businessId,
      amount: appointment.price,
      currency: DEFAULT_CURRENCY,
      method: input.method,
    });

    domainEvents.emitEvent("PaymentCreated", toPaymentDTO(payment));
    return toPaymentDTO(payment);
  },

  async getById(id: string, requesterId: string, requesterRole: RequesterRole): Promise<PaymentDTO> {
    const payment = await getPaymentOrThrow(id);
    await assertCanAccess(payment, requesterId, requesterRole);
    return toPaymentDTO(payment);
  },

  async getByAppointment(appointmentId: string, requesterId: string, requesterRole: RequesterRole): Promise<PaymentDTO> {
    const appointment = await getAppointmentOrThrow(appointmentId);

    const payment = await paymentsRepository.findByAppointmentId(appointmentId);
    if (!payment) throw new NotFoundError("Este agendamento ainda não tem pagamento.", "PAYMENT_NOT_FOUND");

    await assertCanAccess({ userId: appointment.clientId, businessId: appointment.businessId }, requesterId, requesterRole);
    return toPaymentDTO(payment);
  },

  async listMine(userId: string): Promise<PaymentDTO[]> {
    const payments = await paymentsRepository.findByUser(userId);
    return payments.map(toPaymentDTO);
  },

  async listByBusiness(businessId: string, ownerId: string): Promise<PaymentDTO[]> {
    const business = await getBusinessOrThrow(businessId);
    if (business.ownerId !== ownerId) {
      throw new AuthorizationError("Não é o proprietário deste negócio.", "PAYMENT_NOT_AUTHORIZED");
    }

    const payments = await paymentsRepository.findByBusiness(businessId);
    return payments.map(toPaymentDTO);
  },

  async markAsPaid(id: string, requesterId: string, requesterRole: RequesterRole): Promise<PaymentDTO> {
    const payment = await getPaymentOrThrow(id);
    await assertCanManage(payment, requesterId, requesterRole);

    if (payment.status === "PAID") throw new ConflictError("Este pagamento já está pago.", "PAYMENT_ALREADY_PAID");
    if (payment.status === "REFUNDED") throw new ConflictError("Este pagamento já foi reembolsado.", "PAYMENT_ALREADY_REFUNDED");
    if (payment.status !== "PENDING") {
      throw new ConflictError("Só é possível marcar como pago um pagamento pendente.", "PAYMENT_INVALID_STATUS");
    }

    // paidAt is always server-generated — never accepted from the client.
    const updated = await paymentsRepository.updateStatus(id, { status: "PAID", paidAt: new Date() });
    domainEvents.emitEvent("PaymentPaid", toPaymentDTO(updated));
    return toPaymentDTO(updated);
  },

  async markAsFailed(id: string, requesterId: string, requesterRole: RequesterRole): Promise<PaymentDTO> {
    const payment = await getPaymentOrThrow(id);
    await assertCanManage(payment, requesterId, requesterRole);

    if (payment.status === "PAID") throw new ConflictError("Este pagamento já está pago.", "PAYMENT_ALREADY_PAID");
    if (payment.status === "REFUNDED") throw new ConflictError("Este pagamento já foi reembolsado.", "PAYMENT_ALREADY_REFUNDED");
    if (payment.status !== "PENDING") {
      throw new ConflictError("Só é possível marcar como falhado um pagamento pendente.", "PAYMENT_INVALID_STATUS");
    }

    const updated = await paymentsRepository.updateStatus(id, { status: "FAILED" });
    domainEvents.emitEvent("PaymentFailed", toPaymentDTO(updated));
    return toPaymentDTO(updated);
  },

  async refund(id: string, requesterId: string, requesterRole: RequesterRole): Promise<PaymentDTO> {
    const payment = await getPaymentOrThrow(id);
    await assertCanManage(payment, requesterId, requesterRole);

    if (payment.status === "REFUNDED") throw new ConflictError("Este pagamento já foi reembolsado.", "PAYMENT_ALREADY_REFUNDED");
    if (payment.status !== "PAID") {
      throw new ConflictError("Só é possível reembolsar um pagamento pago.", "PAYMENT_INVALID_STATUS");
    }

    // Keep the original paidAt — it's history, not the current state, and the row itself
    // is never deleted.
    const updated = await paymentsRepository.updateStatus(id, { status: "REFUNDED" });
    domainEvents.emitEvent("PaymentRefunded", toPaymentDTO(updated));
    return toPaymentDTO(updated);
  },
};
