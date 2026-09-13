import { beforeEach, describe, expect, it, vi } from "vitest";

const serviceMock = { id: "svc-1", businessId: "biz-1", active: true, duration: 60 };
const professionalMock = { id: "prof-1", businessId: "biz-1", active: true };

const validateBookingContext = vi.fn(async () => ({ service: serviceMock, professional: professionalMock }));
const findActiveInWindow = vi.fn(async () => []);
const findHours = vi.fn(async () => [{ dayOfWeek: 1, startMinute: 540, endMinute: 1020 }]); // Monday 09:00-17:00
const findBlocksInRange = vi.fn(async () => []);

vi.mock("../src/modules/appointments", () => ({
  validateBookingContext: (...args: unknown[]) => validateBookingContext(...args),
  appointmentsRepository: { findActiveInWindow: (...args: unknown[]) => findActiveInWindow(...args) },
}));

vi.mock("../src/modules/businesses", () => ({
  businessesRepository: { findHours: (...args: unknown[]) => findHours(...args) },
}));

vi.mock("../src/modules/professionals", () => ({
  professionalsRepository: { findBlocksInRange: (...args: unknown[]) => findBlocksInRange(...args) },
}));

const { availabilityService } = await import("../src/modules/availability/availability.service");

function nextMonday(): string {
  const date = new Date();
  const day = date.getDay();
  const daysUntilMonday = ((1 - day + 7) % 7) || 7; // always a future Monday
  date.setDate(date.getDate() + daysUntilMonday);
  return date.toISOString().slice(0, 10);
}

beforeEach(() => {
  vi.clearAllMocks();
  validateBookingContext.mockResolvedValue({ service: serviceMock, professional: professionalMock });
  findHours.mockResolvedValue([{ dayOfWeek: 1, startMinute: 540, endMinute: 1020 }]);
  findActiveInWindow.mockResolvedValue([]);
  findBlocksInRange.mockResolvedValue([]);
});

describe("availabilityService.getSlots", () => {
  it("devolve slots dentro do horário de funcionamento", async () => {
    const slots = await availabilityService.getSlots({
      businessId: "biz-1",
      professionalId: "prof-1",
      serviceId: "svc-1",
      date: nextMonday(),
    });

    expect(slots.length).toBeGreaterThan(0);
  });

  it("não devolve slots num dia sem horário configurado (fechado)", async () => {
    findHours.mockResolvedValue([{ dayOfWeek: 1, startMinute: 540, endMinute: 1020 }]); // só segunda

    const sunday = new Date();
    sunday.setDate(sunday.getDate() + ((7 - sunday.getDay()) % 7 || 7));
    const dateStr = sunday.toISOString().slice(0, 10);

    const slots = await availabilityService.getSlots({
      businessId: "biz-1",
      professionalId: "prof-1",
      serviceId: "svc-1",
      date: dateStr,
    });

    expect(slots).toEqual([]);
  });

  it("exclui horários já ocupados por um agendamento existente", async () => {
    const date = nextMonday();
    const occupiedStart = new Date(`${date}T10:00:00`);

    findActiveInWindow.mockResolvedValue([{ scheduledAt: occupiedStart, durationMinutes: 60 }]);

    const slots = await availabilityService.getSlots({
      businessId: "biz-1",
      professionalId: "prof-1",
      serviceId: "svc-1",
      date,
    });

    const has10am = slots.some((slot) => new Date(slot.time).getHours() === 10);
    expect(has10am).toBe(false);
  });

  it("rejeita quando o serviço/profissional não são válidos para o negócio", async () => {
    validateBookingContext.mockRejectedValue(Object.assign(new Error("mismatch"), { code: "SERVICE_BUSINESS_MISMATCH" }));

    await expect(
      availabilityService.getSlots({ businessId: "biz-1", professionalId: "prof-1", serviceId: "svc-2", date: nextMonday() }),
    ).rejects.toMatchObject({ code: "SERVICE_BUSINESS_MISMATCH" });
  });
});
