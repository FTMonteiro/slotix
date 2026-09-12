import type { AppointmentDTO } from "@slotix/types";
import type { CreateAppointmentInput, RescheduleAppointmentInput } from "@slotix/validation";
import { AuthorizationError, ConflictError, NotFoundError, ValidationError } from "../../shared/errors";
import { domainEvents } from "../../shared/events/domainEvents";
import { assertBusinessOwner, getBusinessOrThrow } from "../businesses";
import { getServiceOrThrow } from "../services";
import { getProfessionalOrThrow } from "../professionals";
import { appointmentsRepository } from "./appointments.repository";

type RequesterRole = "CUSTOMER" | "OWNER" | "EMPLOYEE" | "ADMIN";

const OPEN_STATUSES = new Set(["PENDING", "CONFIRMED"]);

function toAppointmentDTO(appointment: {
  id: string;
  businessId: string;
  clientId: string;
  serviceId: string;
  professionalId: string;
  scheduledAt: Date;
  price: { toNumber(): number };
  status: AppointmentDTO["status"];
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}): AppointmentDTO {
  return {
    id: appointment.id,
    businessId: appointment.businessId,
    clientId: appointment.clientId,
    serviceId: appointment.serviceId,
    professionalId: appointment.professionalId,
    scheduledAt: appointment.scheduledAt.toISOString(),
    price: appointment.price.toNumber(),
    status: appointment.status,
    notes: appointment.notes,
    createdAt: appointment.createdAt.toISOString(),
    updatedAt: appointment.updatedAt.toISOString(),
  };
}

async function assertNoOverlap(professionalId: string, scheduledAt: Date, durationMinutes: number, excludeId?: string) {
  const start = scheduledAt;
  const end = new Date(start.getTime() + durationMinutes * 60_000);
  // 24h lookback safely covers any realistically-sized service duration ending after `start`.
  const windowStart = new Date(start.getTime() - 24 * 60 * 60_000);

  const candidates = await appointmentsRepository.findActiveInWindow(professionalId, windowStart, end, excludeId);

  const overlaps = candidates.some((candidate) => {
    const candidateStart = candidate.scheduledAt.getTime();
    const candidateEnd = candidateStart + candidate.durationMinutes * 60_000;
    return candidateStart < end.getTime() && candidateEnd > start.getTime();
  });

  if (overlaps) {
    throw new ConflictError("Este horário não está disponível.", "APPOINTMENT_NOT_AVAILABLE");
  }
}

export async function getAppointmentOrThrow(id: string) {
  const appointment = await appointmentsRepository.findById(id);
  if (!appointment) throw new NotFoundError("Agendamento não encontrado.", "APPOINTMENT_NOT_FOUND");
  return appointment;
}

async function assertCanManage(appointment: { businessId: string; clientId: string }, requesterId: string, requesterRole: RequesterRole) {
  if (requesterRole === "ADMIN") return;
  if (requesterRole === "CUSTOMER" && appointment.clientId === requesterId) return;

  const business = await getBusinessOrThrow(appointment.businessId);
  if (requesterRole === "OWNER" && business.ownerId === requesterId) return;

  throw new AuthorizationError();
}

export const appointmentsService = {
  async create(clientId: string, input: CreateAppointmentInput): Promise<AppointmentDTO> {
    await getBusinessOrThrow(input.businessId);

    const service = await getServiceOrThrow(input.serviceId);
    if (service.businessId !== input.businessId) {
      throw new ValidationError("O serviço não pertence a este negócio.", "SERVICE_BUSINESS_MISMATCH");
    }
    if (!service.active) {
      throw new ValidationError("Este serviço não está disponível.", "SERVICE_INACTIVE");
    }

    const professional = await getProfessionalOrThrow(input.professionalId);
    if (professional.businessId !== input.businessId) {
      throw new ValidationError("O profissional não pertence a este negócio.", "PROFESSIONAL_BUSINESS_MISMATCH");
    }
    if (!professional.active) {
      throw new ValidationError("Este profissional não está disponível.", "PROFESSIONAL_INACTIVE");
    }

    const scheduledAt = new Date(input.scheduledAt);
    if (scheduledAt.getTime() <= Date.now()) {
      throw new ValidationError("A data do agendamento tem de ser no futuro.", "APPOINTMENT_IN_PAST");
    }

    await assertNoOverlap(input.professionalId, scheduledAt, service.duration);

    const appointment = await appointmentsRepository.create({
      businessId: input.businessId,
      clientId,
      serviceId: input.serviceId,
      professionalId: input.professionalId,
      scheduledAt,
      durationMinutes: service.duration,
      price: service.price,
      notes: input.notes,
    });

    domainEvents.emitEvent("AppointmentCreated", toAppointmentDTO(appointment));
    return toAppointmentDTO(appointment);
  },

  async listMineAsClient(clientId: string): Promise<AppointmentDTO[]> {
    const appointments = await appointmentsRepository.findByClient(clientId);
    return appointments.map(toAppointmentDTO);
  },

  async listByBusiness(businessId: string, ownerId: string): Promise<AppointmentDTO[]> {
    const business = await getBusinessOrThrow(businessId);
    assertBusinessOwner(business, ownerId);

    const appointments = await appointmentsRepository.findByBusiness(businessId);
    return appointments.map(toAppointmentDTO);
  },

  async getById(id: string, requesterId: string, requesterRole: RequesterRole): Promise<AppointmentDTO> {
    const appointment = await getAppointmentOrThrow(id);
    await assertCanManage(appointment, requesterId, requesterRole);
    return toAppointmentDTO(appointment);
  },

  async cancel(id: string, requesterId: string, requesterRole: RequesterRole): Promise<AppointmentDTO> {
    const appointment = await getAppointmentOrThrow(id);
    await assertCanManage(appointment, requesterId, requesterRole);

    if (!OPEN_STATUSES.has(appointment.status)) {
      throw new ConflictError("Este agendamento já não pode ser cancelado.", "APPOINTMENT_NOT_CANCELLABLE");
    }

    const updated = await appointmentsRepository.update(id, { status: "CANCELLED" });
    domainEvents.emitEvent("AppointmentCancelled", toAppointmentDTO(updated));
    return toAppointmentDTO(updated);
  },

  async confirm(id: string, ownerId: string): Promise<AppointmentDTO> {
    const appointment = await getAppointmentOrThrow(id);
    const business = await getBusinessOrThrow(appointment.businessId);
    assertBusinessOwner(business, ownerId);

    if (appointment.status !== "PENDING") {
      throw new ConflictError("Só é possível confirmar agendamentos pendentes.", "APPOINTMENT_NOT_PENDING");
    }

    const updated = await appointmentsRepository.update(id, { status: "CONFIRMED" });
    return toAppointmentDTO(updated);
  },

  async complete(id: string, ownerId: string): Promise<AppointmentDTO> {
    const appointment = await getAppointmentOrThrow(id);
    const business = await getBusinessOrThrow(appointment.businessId);
    assertBusinessOwner(business, ownerId);

    if (!OPEN_STATUSES.has(appointment.status)) {
      throw new ConflictError("Este agendamento não pode ser concluído.", "APPOINTMENT_NOT_COMPLETABLE");
    }

    const updated = await appointmentsRepository.update(id, { status: "COMPLETED" });
    return toAppointmentDTO(updated);
  },

  async reschedule(id: string, requesterId: string, requesterRole: RequesterRole, input: RescheduleAppointmentInput): Promise<AppointmentDTO> {
    const appointment = await getAppointmentOrThrow(id);
    await assertCanManage(appointment, requesterId, requesterRole);

    if (!OPEN_STATUSES.has(appointment.status)) {
      throw new ConflictError("Este agendamento não pode ser reagendado.", "APPOINTMENT_NOT_RESCHEDULABLE");
    }

    const scheduledAt = new Date(input.scheduledAt);
    if (scheduledAt.getTime() <= Date.now()) {
      throw new ValidationError("A data do agendamento tem de ser no futuro.", "APPOINTMENT_IN_PAST");
    }

    await assertNoOverlap(appointment.professionalId, scheduledAt, appointment.durationMinutes, id);

    const updated = await appointmentsRepository.update(id, { scheduledAt });
    return toAppointmentDTO(updated);
  },
};
