import { describe, expect, it } from "vitest";
import { haversineDistanceKm } from "../src/shared/utils/geo";

describe("haversineDistanceKm", () => {
  it("devolve 0 para o mesmo ponto", () => {
    expect(haversineDistanceKm(38.7223, -9.1393, 38.7223, -9.1393)).toBeCloseTo(0, 5);
  });

  it("é simétrica", () => {
    const a = haversineDistanceKm(38.7223, -9.1393, 41.1579, -8.6291);
    const b = haversineDistanceKm(41.1579, -8.6291, 38.7223, -9.1393);
    expect(a).toBeCloseTo(b, 5);
  });

  it("calcula corretamente a distância Lisboa-Porto (~274km)", () => {
    const distance = haversineDistanceKm(38.7223, -9.1393, 41.1579, -8.6291);
    expect(distance).toBeGreaterThan(270);
    expect(distance).toBeLessThan(280);
  });

  it("funciona para coordenadas fora de Angola/Portugal (não está limitado a uma região)", () => {
    // Nova Iorque -> Tóquio, ~10850km
    const distance = haversineDistanceKm(40.7128, -74.006, 35.6762, 139.6503);
    expect(distance).toBeGreaterThan(10500);
    expect(distance).toBeLessThan(11200);
  });
});
