import { describe, expect, it } from "vitest";
import { weightedRating } from "../src/shared/utils/ranking";

describe("weightedRating", () => {
  it("uma única avaliação de 5 estrelas não bate um negócio com centenas de avaliações consistentes de 4.6", () => {
    const singleFiveStar = weightedRating(5, 1);
    const manyConsistentReviews = weightedRating(4.6, 300);

    expect(manyConsistentReviews).toBeGreaterThan(singleFiveStar);
  });

  it("sem avaliações, aproxima-se do prior neutro (nem no topo nem no fundo)", () => {
    const score = weightedRating(null, 0);
    expect(score).toBeGreaterThan(2);
    expect(score).toBeLessThan(4);
  });

  it("converge para a média real à medida que o número de avaliações cresce", () => {
    const fewReviews = weightedRating(4.8, 2);
    const manyReviews = weightedRating(4.8, 5000);

    // com muitas reviews, aproxima-se bastante da média real
    expect(manyReviews).toBeGreaterThan(4.7);
    // com poucas, fica mais perto do prior do que a média real
    expect(fewReviews).toBeLessThan(4.8);
  });

  it("é monótona: mais avaliações positivas nunca reduzem o score", () => {
    const a = weightedRating(4.5, 10);
    const b = weightedRating(4.5, 50);
    expect(b).toBeGreaterThanOrEqual(a);
  });
});
