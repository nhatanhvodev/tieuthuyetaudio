export type RecommendationInteraction = {
  type: "follow" | "progress";
  seriesId: string;
  categorySlugs: string[];
  occurredAt: Date;
  completed?: boolean;
  completionPercent?: number;
};

export type RecommendationCandidate = {
  id: string;
  slug: string;
  title: string;
  categorySlugs: string[];
  createdAt: Date;
  averageRating: number;
  listenCount: number;
};

export type RecommendationSignals = {
  followedSeriesIds: Set<string>;
  followWeights: Map<string, number>;
  categoryWeights: Map<string, number>;
  completionWeights: Map<string, number>;
  recencyWeights: Map<string, number>;
  referenceTime: Date;
};

export type RankedRecommendation = {
  series: RecommendationCandidate;
  score: number;
};

function uniqueCategorySlugs(categorySlugs: string[]) {
  return [...new Set(categorySlugs.filter(Boolean))];
}

function addWeight(map: Map<string, number>, categorySlug: string, amount: number) {
  map.set(categorySlug, (map.get(categorySlug) ?? 0) + amount);
}

function getRecencyWeight(daysSinceEvent: number) {
  if (daysSinceEvent <= 1) return 3;
  if (daysSinceEvent <= 3) return 2.4;
  if (daysSinceEvent <= 7) return 1.8;
  if (daysSinceEvent <= 14) return 1.1;
  return 0.4;
}

function getFreshnessBoost(daysSinceCreation: number) {
  if (daysSinceCreation <= 2) return 1.2;
  if (daysSinceCreation <= 7) return 0.8;
  if (daysSinceCreation <= 14) return 0.35;
  return 0;
}

function daysBetween(left: Date, right: Date) {
  return Math.max(0, (left.getTime() - right.getTime()) / (24 * 60 * 60 * 1000));
}

export function buildRecommendationSignals(
  interactions: RecommendationInteraction[],
  referenceTime = new Date()
): RecommendationSignals {
  const followedSeriesIds = new Set<string>();
  const followWeights = new Map<string, number>();
  const categoryWeights = new Map<string, number>();
  const completionWeights = new Map<string, number>();
  const recencyWeights = new Map<string, number>();

  for (const interaction of interactions) {
    const categorySlugs = uniqueCategorySlugs(interaction.categorySlugs);
    const recencyWeight = getRecencyWeight(daysBetween(referenceTime, interaction.occurredAt));

    if (interaction.type === "follow") {
      followedSeriesIds.add(interaction.seriesId);
      for (const categorySlug of categorySlugs) {
        addWeight(followWeights, categorySlug, 3.2);
        addWeight(categoryWeights, categorySlug, 1.8);
        addWeight(recencyWeights, categorySlug, recencyWeight * 0.6);
      }
      continue;
    }

    const completionPercent = interaction.completionPercent ?? 0;
    const completionWeight =
      interaction.completed || completionPercent >= 95
        ? 3.4
        : completionPercent >= 70
          ? 2.1
          : completionPercent >= 35
            ? 1.1
            : 0.45;

    for (const categorySlug of categorySlugs) {
      addWeight(categoryWeights, categorySlug, 1 + recencyWeight * 0.45);
      addWeight(recencyWeights, categorySlug, recencyWeight);
      addWeight(completionWeights, categorySlug, completionWeight);
    }
  }

  return {
    followedSeriesIds,
    followWeights,
    categoryWeights,
    completionWeights,
    recencyWeights,
    referenceTime
  };
}

function scoreCandidate(series: RecommendationCandidate, signals: RecommendationSignals) {
  const categorySlugs = uniqueCategorySlugs(series.categorySlugs);

  const followScore = categorySlugs.reduce((total, categorySlug) => total + (signals.followWeights.get(categorySlug) ?? 0), 0);
  const categoryScore = categorySlugs.reduce((total, categorySlug) => total + (signals.categoryWeights.get(categorySlug) ?? 0), 0);
  const completionScore = categorySlugs.reduce((total, categorySlug) => total + (signals.completionWeights.get(categorySlug) ?? 0), 0);
  const recencyScore = categorySlugs.reduce((total, categorySlug) => total + (signals.recencyWeights.get(categorySlug) ?? 0), 0);
  const freshnessBoost = getFreshnessBoost(daysBetween(signals.referenceTime, series.createdAt));
  const qualityBoost = series.averageRating * 0.35 + Math.log10(series.listenCount + 10) * 0.45;

  return Number((followScore * 1.45 + categoryScore * 1.1 + completionScore * 1.35 + recencyScore * 1.2 + freshnessBoost + qualityBoost).toFixed(4));
}

export function rankSeriesForRecommendation(
  candidates: RecommendationCandidate[],
  signals: RecommendationSignals,
  take = candidates.length
): RankedRecommendation[] {
  return candidates
    .filter((series) => !signals.followedSeriesIds.has(series.id))
    .map((series) => ({
      series,
      score: scoreCandidate(series, signals)
    }))
    .filter((item) => item.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      if (right.series.averageRating !== left.series.averageRating) return right.series.averageRating - left.series.averageRating;
      if (right.series.listenCount !== left.series.listenCount) return right.series.listenCount - left.series.listenCount;
      return right.series.createdAt.getTime() - left.series.createdAt.getTime();
    })
    .slice(0, take);
}
