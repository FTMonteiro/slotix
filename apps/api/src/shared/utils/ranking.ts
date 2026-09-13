// A neutral prior a business is pulled toward until it has enough reviews of its own —
// this is what stops one 5-star review from outranking a business with hundreds of
// consistent 4.6-star reviews (a plain average would let it).
const PRIOR_MEAN = 3.5;
const PRIOR_WEIGHT = 10;

/**
 * Bayesian-average style weighted rating: shrinks toward PRIOR_MEAN when `ratingCount`
 * is low, and converges to the plain average as review count grows. Used only for
 * ranking/sorting — the raw ratingAvg/ratingCount are still what's shown to users and
 * what a literal `minRating` filter compares against.
 */
export function weightedRating(ratingAvg: number | null, ratingCount: number): number {
  const avg = ratingAvg ?? PRIOR_MEAN;
  return (PRIOR_WEIGHT * PRIOR_MEAN + ratingCount * avg) / (PRIOR_WEIGHT + ratingCount);
}
