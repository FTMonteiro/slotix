import { beforeEach, describe, expect, it, vi } from "vitest";

const businessMock = { id: "biz-1", ownerId: "owner-1" };
const serviceMock = { id: "svc-1", businessId: "biz-1", active: true, duration: 30, price: { toNumber: () => 15 } };
const professionalMock = { id: "prof-1", businessId: "biz-1", active: true };

const getBusinessOrThrow = vi.fn(async () => businessMock);
const assertBusinessOwner = vi.fn();
const getServiceOrThrow = vi.fn(async () => serviceMock);
const getProfessionalOrThrow = vi.fn(async () => professionalMock);

const create = vi.fn();
const findById = vi.fn();
const findActiveInWindow = vi.fn(async () => []);
const update = vi.fn();

const emitEvent = vi.fn();

vi.mock("../src/modules/businesses", () => ({
  getBusinessOrThrow: (...args: unknown[]) => getBusinessOrThrow(...args),
  assertBusinessOwner: (...args: unknown[]) => assertBusinessOwner(...args),
}));

vi.mock("../src/modules/services", () => ({
  getServiceOrThrow: (...args: unknown[]) => getServiceOrThrow(...args),
}));

vi.mock("../src/modules/professionals", () => ({
  getProfessionalOrThrow: (...args: unknown[]) => getProfessionalOrThrow(...args),
}));

vi.mock("../src/modules/appointments/appointments.repository", () => ({
  appointmentsRepository: {
    create: (...args: unknown[]) => create(...args),
    findById: (...args: unknown[]) => findById(...args),
    findActiveInWindow: (...args: unknown[]) => findActiveInWindow(...args),
    update: (...args: unknown[]) => update(...args),
  },
}));

vi.mock("../src/shared/events/domainEvents", () => ({
  domainEvents: { emitEvent: (...args: unknown[]) => emitEvent(...args) },
}));

const { appointmentsService } = await import("../src/modules/appointments/appointments.service");

const futureDate = () => new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

function makeAppointmentRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: "appt-1",
    businessId: "biz-1",
    clientId: "client-1",
    serviceId: "svc-1",
    professionalId: "prof-1",
    scheduledAt: new Date(futureDate()),
    durationMinutes: 30,
    price: { toNumber: () => 15 },
    status: "PENDING",
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  getBusinessOrThrow.mockResolvedValue(businessMock);
  getServiceOrThrow.mockResolvedValue(serviceMock);
  getProfessionalOrThrow.mockResolvedValue(professionalMock);
  findActiveInWindow.mockResolvedValue([]);
});

describe("appointmentsService.create", () => {
  it("cria o agendamento quando tudo é válido e não há sobreposição", async () => {
    create.mockResolvedValue(makeAppointmentRecord());

    const result = await appointmentsService.create("client-1", {
      businessId: "biz-1",
      serviceId: "svc-1",
      professionalId: "prof-1",
      scheduledAt: futureDate(),
    });

    expect(result.status).toBe("PENDING");
    expect(emitEvent).toHaveBeenCalledWith("AppointmentCreated", expect.objectContaining({ id: "appt-1" }));
  });

  it("rejeita quando o serviço não existe", async () => {
    getServiceOrThrow.mockRejectedValue(Object.assign(new Error("not found"), { code: "SERVICE_NOT_FOUND" }));

    await expect(
      appointmentsService.create("client-1", {
        businessId: "biz-1",
        serviceId: "does-not-exist",
        professionalId: "prof-1",
        scheduledAt: futureDate(),
      }),
    ).rejects.toThrow();
  });

  it("rejeita quando o profissional não existe", async () => {
    getProfessionalOrThrow.mockRejectedValue(Object.assign(new Error("not found"), { code: "PROFESSIONAL_NOT_FOUND" }));

    await expect(
      appointmentsService.create("client-1", {
        businessId: "biz-1",
        serviceId: "svc-1",
        professionalId: "does-not-exist",
        scheduledAt: futureDate(),
      }),
    ).rejects.toThrow();
  });

  it("rejeita quando o serviço está inativo", async () => {
    getServiceOrThrow.mockResolvedValue({ ...serviceMock, active: false });

    await expect(
      appointmentsService.create("client-1", {
        businessId: "biz-1",
        serviceId: "svc-1",
        professionalId: "prof-1",
        scheduledAt: futureDate(),
      }),
    ).rejects.toMatchObject({ code: "SERVICE_INACTIVE" });
  });

  it("rejeita quando o horário já está ocupado para o profissional", async () => {
    findActiveInWindow.mockResolvedValue([
      { scheduledAt: new Date(futureDate()), durationMinutes: 30 },
    ]);

    await expect(
      appointmentsService.create("client-1", {
        businessId: "biz-1",
        serviceId: "svc-1",
        professionalId: "prof-1",
        scheduledAt: futureDate(),
      }),
    ).rejects.toMatchObject({ code: "APPOINTMENT_NOT_AVAILABLE" });
  });
});

describe("appointmentsService.cancel", () => {
  it("permite ao cliente cancelar o seu próprio agendamento pendente", async () => {
    findById.mockResolvedValue(makeAppointmentRecord({ status: "PENDING", clientId: "client-1" }));
    update.mockResolvedValue(makeAppointmentRecord({ status: "CANCELLED", clientId: "client-1" }));

    const result = await appointmentsService.cancel("appt-1", "client-1", "CUSTOMER");
    expect(result.status).toBe("CANCELLED");
  });

  it("rejeita cancelar um agendamento já concluído", async () => {
    findById.mockResolvedValue(makeAppointmentRecord({ status: "COMPLETED", clientId: "client-1" }));

    await expect(appointmentsService.cancel("appt-1", "client-1", "CUSTOMER")).rejects.toMatchObject({
      code: "APPOINTMENT_NOT_CANCELLABLE",
    });
  });

  it("rejeita cancelar o agendamento de outro cliente", async () => {
    findById.mockResolvedValue(makeAppointmentRecord({ status: "PENDING", clientId: "client-1" }));

    await expect(appointmentsService.cancel("appt-1", "someone-else", "CUSTOMER")).rejects.toThrow();
  });
});
