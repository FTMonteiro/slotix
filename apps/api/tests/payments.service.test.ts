import { beforeEach, describe, expect, it, vi } from "vitest";

const appointmentMock = {
  id: "appt-1",
  businessId: "biz-1",
  clientId: "client-1",
  status: "COMPLETED" as string,
  price: { toNumber: () => 15 },
};

const businessMock = { id: "biz-1", ownerId: "owner-1" };

const getAppointmentOrThrow = vi.fn(async () => appointmentMock);
const getBusinessOrThrow = vi.fn(async () => businessMock);

const create = vi.fn();
const findById = vi.fn();
const findByAppointmentId = vi.fn(async () => null as unknown);
const findByUser = vi.fn();
const findByBusiness = vi.fn();
const updateStatus = vi.fn();

const emitEvent = vi.fn();

vi.mock("../src/modules/appointments", () => ({
  getAppointmentOrThrow: (...args: unknown[]) => getAppointmentOrThrow(...args),
}));

vi.mock("../src/modules/businesses", () => ({
  getBusinessOrThrow: (...args: unknown[]) => getBusinessOrThrow(...args),
}));

vi.mock("../src/modules/payments/payments.repository", () => ({
  paymentsRepository: {
    create: (...args: unknown[]) => create(...args),
    findById: (...args: unknown[]) => findById(...args),
    findByAppointmentId: (...args: unknown[]) => findByAppointmentId(...args),
    findByUser: (...args: unknown[]) => findByUser(...args),
    findByBusiness: (...args: unknown[]) => findByBusiness(...args),
    updateStatus: (...args: unknown[]) => updateStatus(...args),
  },
}));

vi.mock("../src/shared/events/domainEvents", () => ({
  domainEvents: { emitEvent: (...args: unknown[]) => emitEvent(...args) },
}));

const { paymentsService } = await import("../src/modules/payments/payments.service");

function makePaymentRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: "pay-1",
    appointmentId: "appt-1",
    userId: "client-1",
    businessId: "biz-1",
    amount: { toNumber: () => 15 },
    currency: "AOA",
    method: "CASH",
    status: "PENDING",
    paidAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  getAppointmentOrThrow.mockResolvedValue(appointmentMock);
  getBusinessOrThrow.mockResolvedValue(businessMock);
  findByAppointmentId.mockResolvedValue(null);
});

describe("paymentsService.create", () => {
  it("cria o pagamento com o valor vindo da appointment, nunca do body", async () => {
    create.mockResolvedValue(makePaymentRecord());

    const result = await paymentsService.create("client-1", "CUSTOMER", { appointmentId: "appt-1", method: "CASH" });

    expect(result.amount).toBe(15);
    expect(result.status).toBe("PENDING");
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ amount: appointmentMock.price, userId: "client-1", businessId: "biz-1" }));
    expect(emitEvent).toHaveBeenCalledWith("PaymentCreated", expect.objectContaining({ id: "pay-1" }));
  });

  it("rejeita quando a appointment não existe", async () => {
    getAppointmentOrThrow.mockRejectedValue(Object.assign(new Error("not found"), { code: "APPOINTMENT_NOT_FOUND" }));

    await expect(paymentsService.create("client-1", "CUSTOMER", { appointmentId: "does-not-exist", method: "CASH" })).rejects.toMatchObject({
      code: "APPOINTMENT_NOT_FOUND",
    });
  });

  it("rejeita pagar uma appointment cancelada", async () => {
    getAppointmentOrThrow.mockResolvedValue({ ...appointmentMock, status: "CANCELLED" });

    await expect(paymentsService.create("client-1", "CUSTOMER", { appointmentId: "appt-1", method: "CASH" })).rejects.toMatchObject({
      code: "PAYMENT_APPOINTMENT_CANCELLED",
    });
  });

  it("rejeita pagar a appointment de outro utilizador", async () => {
    await expect(paymentsService.create("someone-else", "CUSTOMER", { appointmentId: "appt-1", method: "CASH" })).rejects.toMatchObject({
      code: "PAYMENT_NOT_AUTHORIZED",
    });
  });

  it("permite a um ADMIN criar o pagamento em nome do cliente", async () => {
    create.mockResolvedValue(makePaymentRecord());

    await expect(paymentsService.create("admin-1", "ADMIN", { appointmentId: "appt-1", method: "CASH" })).resolves.toBeDefined();
  });

  it("rejeita um pagamento duplicado para a mesma appointment", async () => {
    findByAppointmentId.mockResolvedValue(makePaymentRecord());

    await expect(paymentsService.create("client-1", "CUSTOMER", { appointmentId: "appt-1", method: "CASH" })).rejects.toMatchObject({
      code: "PAYMENT_ALREADY_EXISTS",
    });
  });
});

describe("paymentsService.markAsPaid", () => {
  it("o dono do negócio marca um pagamento pendente como pago, com paidAt gerado pelo backend", async () => {
    findById.mockResolvedValue(makePaymentRecord({ status: "PENDING" }));
    updateStatus.mockResolvedValue(makePaymentRecord({ status: "PAID", paidAt: new Date() }));

    const result = await paymentsService.markAsPaid("pay-1", "owner-1", "OWNER");

    expect(result.status).toBe("PAID");
    expect(result.paidAt).not.toBeNull();
    expect(updateStatus).toHaveBeenCalledWith("pay-1", expect.objectContaining({ status: "PAID", paidAt: expect.any(Date) }));
    expect(emitEvent).toHaveBeenCalledWith("PaymentPaid", expect.objectContaining({ status: "PAID" }));
  });

  it("rejeita quando quem pede não é o dono do negócio nem admin", async () => {
    findById.mockResolvedValue(makePaymentRecord({ status: "PENDING" }));

    await expect(paymentsService.markAsPaid("pay-1", "client-1", "CUSTOMER")).rejects.toMatchObject({ code: "PAYMENT_NOT_AUTHORIZED" });
  });

  it("rejeita marcar como pago um pagamento já pago", async () => {
    findById.mockResolvedValue(makePaymentRecord({ status: "PAID", paidAt: new Date() }));

    await expect(paymentsService.markAsPaid("pay-1", "owner-1", "OWNER")).rejects.toMatchObject({ code: "PAYMENT_ALREADY_PAID" });
  });

  it("rejeita marcar como pago um pagamento já reembolsado", async () => {
    findById.mockResolvedValue(makePaymentRecord({ status: "REFUNDED" }));

    await expect(paymentsService.markAsPaid("pay-1", "owner-1", "OWNER")).rejects.toMatchObject({ code: "PAYMENT_ALREADY_REFUNDED" });
  });
});

describe("paymentsService.markAsFailed", () => {
  it("PENDING -> FAILED é uma transição válida", async () => {
    findById.mockResolvedValue(makePaymentRecord({ status: "PENDING" }));
    updateStatus.mockResolvedValue(makePaymentRecord({ status: "FAILED" }));

    const result = await paymentsService.markAsFailed("pay-1", "owner-1", "OWNER");
    expect(result.status).toBe("FAILED");
    expect(result.paidAt).toBeNull();
  });

  it("rejeita marcar como falhado um pagamento já pago", async () => {
    findById.mockResolvedValue(makePaymentRecord({ status: "PAID", paidAt: new Date() }));

    await expect(paymentsService.markAsFailed("pay-1", "owner-1", "OWNER")).rejects.toMatchObject({ code: "PAYMENT_ALREADY_PAID" });
  });
});

describe("paymentsService.refund", () => {
  it("PAID -> REFUNDED é uma transição válida e mantém o histórico (paidAt)", async () => {
    const paidAt = new Date();
    findById.mockResolvedValue(makePaymentRecord({ status: "PAID", paidAt }));
    updateStatus.mockResolvedValue(makePaymentRecord({ status: "REFUNDED", paidAt }));

    const result = await paymentsService.refund("pay-1", "owner-1", "OWNER");

    expect(result.status).toBe("REFUNDED");
    expect(result.paidAt).not.toBeNull();
    expect(updateStatus).toHaveBeenCalledWith("pay-1", { status: "REFUNDED" });
  });

  it("rejeita reembolsar um pagamento pendente (PENDING -> REFUNDED é inválido)", async () => {
    findById.mockResolvedValue(makePaymentRecord({ status: "PENDING" }));

    await expect(paymentsService.refund("pay-1", "owner-1", "OWNER")).rejects.toMatchObject({ code: "PAYMENT_INVALID_STATUS" });
  });

  it("rejeita reembolsar um pagamento já reembolsado", async () => {
    findById.mockResolvedValue(makePaymentRecord({ status: "REFUNDED" }));

    await expect(paymentsService.refund("pay-1", "owner-1", "OWNER")).rejects.toMatchObject({ code: "PAYMENT_ALREADY_REFUNDED" });
  });
});

describe("paymentsService.getById", () => {
  it("o pagador consegue ver o seu próprio pagamento", async () => {
    findById.mockResolvedValue(makePaymentRecord());
    await expect(paymentsService.getById("pay-1", "client-1", "CUSTOMER")).resolves.toBeDefined();
  });

  it("um cliente sem relação com o pagamento não consegue vê-lo", async () => {
    findById.mockResolvedValue(makePaymentRecord());
    await expect(paymentsService.getById("pay-1", "someone-else", "CUSTOMER")).rejects.toMatchObject({ code: "PAYMENT_NOT_AUTHORIZED" });
  });

  it("o dono do negócio consegue ver o pagamento", async () => {
    findById.mockResolvedValue(makePaymentRecord());
    await expect(paymentsService.getById("pay-1", "owner-1", "OWNER")).resolves.toBeDefined();
  });
});
