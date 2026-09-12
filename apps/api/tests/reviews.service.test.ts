import { beforeEach, describe, expect, it, vi } from "vitest";

const appointmentMock = {
  id: "appt-1",
  businessId: "biz-1",
  clientId: "client-1",
  status: "COMPLETED" as string,
};

const getAppointmentOrThrow = vi.fn(async () => appointmentMock);
const findByAppointment = vi.fn(async () => null as unknown);
const create = vi.fn();

vi.mock("../src/modules/appointments", () => ({
  getAppointmentOrThrow: (...args: unknown[]) => getAppointmentOrThrow(...args),
}));

vi.mock("../src/modules/reviews/reviews.repository", () => ({
  reviewsRepository: {
    findByAppointment: (...args: unknown[]) => findByAppointment(...args),
    create: (...args: unknown[]) => create(...args),
  },
}));

const { reviewsService } = await import("../src/modules/reviews/reviews.service");

beforeEach(() => {
  vi.clearAllMocks();
  getAppointmentOrThrow.mockResolvedValue(appointmentMock);
  findByAppointment.mockResolvedValue(null);
});

describe("reviewsService.create", () => {
  it("cria a avaliação quando o agendamento está concluído e pertence ao cliente", async () => {
    create.mockResolvedValue({
      id: "review-1",
      businessId: "biz-1",
      clientId: "client-1",
      appointmentId: "appt-1",
      rating: 5,
      comment: "Ótimo!",
      createdAt: new Date(),
      updatedAt: new Date(),
      client: { name: "Cliente Teste" },
    });

    const result = await reviewsService.create("client-1", { appointmentId: "appt-1", rating: 5, comment: "Ótimo!" });
    expect(result.rating).toBe(5);
  });

  it("rejeita quando o agendamento é de outro cliente", async () => {
    await expect(
      reviewsService.create("someone-else", { appointmentId: "appt-1", rating: 5 }),
    ).rejects.toMatchObject({ code: "AUTHORIZATION_ERROR" });
  });

  it("rejeita quando o agendamento ainda não está concluído", async () => {
    getAppointmentOrThrow.mockResolvedValue({ ...appointmentMock, status: "PENDING" });

    await expect(
      reviewsService.create("client-1", { appointmentId: "appt-1", rating: 4 }),
    ).rejects.toMatchObject({ code: "APPOINTMENT_NOT_COMPLETED" });
  });

  it("rejeita avaliar o mesmo agendamento duas vezes", async () => {
    findByAppointment.mockResolvedValue({ id: "review-existing" });

    await expect(
      reviewsService.create("client-1", { appointmentId: "appt-1", rating: 3 }),
    ).rejects.toMatchObject({ code: "REVIEW_ALREADY_EXISTS" });
  });
});
