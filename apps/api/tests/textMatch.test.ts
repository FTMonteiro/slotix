import { describe, expect, it } from "vitest";
import { countMatchingWords, splitSearchWords } from "../src/shared/utils/textMatch";

describe("splitSearchWords", () => {
  it("divide em palavras minúsculas", () => {
    expect(splitSearchWords("Cortar Cabelo")).toEqual(["cortar", "cabelo"]);
  });

  it("ignora palavras com menos de 2 caracteres", () => {
    expect(splitSearchWords("a de cabelo")).toEqual(["de", "cabelo"]);
  });

  it("limita a 8 palavras", () => {
    const words = splitSearchWords("um dois tres quatro cinco seis sete oito nove dez");
    expect(words.length).toBe(8);
  });
});

describe("countMatchingWords", () => {
  it("encontra 'cabelo' em 'Corte de Cabelo' mesmo sem 'cortar' aparecer literalmente", () => {
    const words = splitSearchWords("cortar cabelo");
    const score = countMatchingWords(words, "Corte de Cabelo", null, "corte");
    expect(score).toBe(1);
  });

  it("conta todas as palavras que aparecem", () => {
    const words = splitSearchWords("corte barba");
    const score = countMatchingWords(words, "Corte e Barba Completo");
    expect(score).toBe(2);
  });

  it("devolve 0 quando nada corresponde", () => {
    const words = splitSearchWords("manicure");
    expect(countMatchingWords(words, "Corte de Cabelo", "Barbearia")).toBe(0);
  });
});
