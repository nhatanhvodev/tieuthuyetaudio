import { performance } from "node:perf_hooks";
import { db } from "@/lib/db";
import { getRecommendedSeriesForUser } from "@/lib/series/queries";

const ITERATIONS = 15;
const P95_LIMIT_MS = 250;
const MAX_LIMIT_MS = 400;

function percentile(sortedValues: number[], ratio: number) {
  const index = Math.min(sortedValues.length - 1, Math.max(0, Math.ceil(sortedValues.length * ratio) - 1));
  return sortedValues[index];
}

async function main() {
  const user = await db.user.findUnique({
    where: {
      email: "user@tieuthuyetaudio.local"
    },
    select: {
      id: true,
      email: true
    }
  });

  if (!user) {
    throw new Error("Missing demo user for latency validation. Run db:seed first.");
  }

  await getRecommendedSeriesForUser(user.id, 8);

  const durations: number[] = [];
  let lastResultCount = 0;

  for (let index = 0; index < ITERATIONS; index += 1) {
    const startedAt = performance.now();
    const result = await getRecommendedSeriesForUser(user.id, 8);
    durations.push(performance.now() - startedAt);
    lastResultCount = result.length;
  }

  if (!lastResultCount) {
    throw new Error("Recommendation query returned no results for the seeded demo user.");
  }

  const sortedDurations = [...durations].sort((left, right) => left - right);
  const average = durations.reduce((total, value) => total + value, 0) / durations.length;
  const p95 = percentile(sortedDurations, 0.95);
  const max = sortedDurations[sortedDurations.length - 1];

  console.log(
    JSON.stringify(
      {
        iterations: ITERATIONS,
        averageMs: Number(average.toFixed(2)),
        p95Ms: Number(p95.toFixed(2)),
        maxMs: Number(max.toFixed(2)),
        results: lastResultCount
      },
      null,
      2
    )
  );

  if (p95 > P95_LIMIT_MS || max > MAX_LIMIT_MS) {
    throw new Error(`Recommendation latency budget exceeded: p95=${p95.toFixed(2)}ms max=${max.toFixed(2)}ms`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
