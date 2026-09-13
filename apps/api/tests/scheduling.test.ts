import { describe, expect, it } from "vitest";
import { computeAvailableSlots, isFreeOfConflicts, isSlotAvailable, isWithinBusinessHours, resolveDayHours } from "../src/shared/utils/scheduling";

const NINE_TO_FIVE = [{ startMinute: 540, endMinute: 1020 }]; // 09:00-17:00

function at(hours: number, minutes = 0): Date {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

describe("isWithinBusinessHours", () => {
  it("aceita um slot totalmente dentro do horário", () => {
    expect(isWithinBusinessHours({ start: at(10), end: at(10, 30) }, NINE_TO_FIVE)).toBe(true);
  });

  it("rejeita um slot que termina depois do fecho", () => {
    expect(isWithinBusinessHours({ start: at(16, 45), end: at(17, 15) }, NINE_TO_FIVE)).toBe(false);
  });

  it("rejeita um slot antes da abertura", () => {
    expect(isWithinBusinessHours({ start: at(8, 30), end: at(9) }, NINE_TO_FIVE)).toBe(false);
  });

  it("sem janelas de horário, nada está dentro do horário", () => {
    expect(isWithinBusinessHours({ start: at(10), end: at(10, 30) }, [])).toBe(false);
  });
});

describe("isFreeOfConflicts", () => {
  it("deteta sobreposição parcial", () => {
    const busy = [{ start: at(10), end: at(11) }];
    expect(isFreeOfConflicts({ start: at(10, 30), end: at(11, 30) }, busy)).toBe(false);
  });

  it("permite slots adjacentes sem sobreposição", () => {
    const busy = [{ start: at(10), end: at(11) }];
    expect(isFreeOfConflicts({ start: at(11), end: at(12) }, busy)).toBe(true);
  });
});

describe("isSlotAvailable", () => {
  it("rejeita horários no passado", () => {
    const now = at(12);
    expect(isSlotAvailable({ start: at(10), end: at(10, 30) }, NINE_TO_FIVE, [], now)).toBe(false);
  });

  it("aceita um slot futuro, dentro do horário e sem conflitos", () => {
    const now = at(8);
    expect(isSlotAvailable({ start: at(10), end: at(10, 30) }, NINE_TO_FIVE, [], now)).toBe(true);
  });
});

describe("resolveDayHours", () => {
  it("sem nenhuma hora configurada para o negócio, considera aberto o dia todo", () => {
    expect(resolveDayHours([], 1)).toEqual([{ startMinute: 0, endMinute: 1440 }]);
  });

  it("com horas configuradas, um dia sem linhas próprias fica fechado", () => {
    const allHours = [
      { dayOfWeek: 1, startMinute: 540, endMinute: 1020 },
      { dayOfWeek: 2, startMinute: 540, endMinute: 1020 },
    ];
    expect(resolveDayHours(allHours, 0)).toEqual([]); // domingo (0) fechado
    expect(resolveDayHours(allHours, 1)).toEqual([{ dayOfWeek: 1, startMinute: 540, endMinute: 1020 }]);
  });
});

describe("computeAvailableSlots", () => {
  it("gera slots dentro do horário, respeitando a duração do serviço", () => {
    const date = at(0);
    const now = at(0);
    const slots = computeAvailableSlots({ date, durationMinutes: 60, dayHours: NINE_TO_FIVE, busy: [], stepMinutes: 60, now });

    // 09:00 .. 16:00 de hora a hora = 8 slots (16:00-17:00 é o último que cabe)
    expect(slots.length).toBe(8);
    expect(slots[0].getHours()).toBe(9);
    expect(slots[slots.length - 1].getHours()).toBe(16);
  });

  it("exclui slots ocupados por um agendamento existente", () => {
    const date = at(0);
    const now = at(0);
    const busy = [{ start: at(10), end: at(11) }];
    const slots = computeAvailableSlots({ date, durationMinutes: 60, dayHours: NINE_TO_FIVE, busy, stepMinutes: 60, now });

    expect(slots.some((s) => s.getHours() === 10)).toBe(false);
  });
});
