import Link from "next/link";
import { Headphones, Play, Star } from "lucide-react";
import { CoverImage } from "@/components/common/cover-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StoryCardSkeleton } from "@/components/series/story-card-skeleton";
import type { SeriesWithRelations } from "@/lib/series/queries";
import { formatCount, formatStatus } from "@/lib/format";

function getAutoBadges(series: SeriesWithRelations): string[] {
  const badges: string[] = [];
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  if (new Date(series.createdAt) >= sevenDaysAgo) badges.push("Mới");
  if (series.listenCount >= 10000) badges.push("Hot");
  return badges;
}

function Cover({
  title,
  coverUrl,
  progress
}: {
  title: string;
  coverUrl?: string | null;
  progress?: { currentSeconds: number; durationSeconds: number } | null;
}) {
  const percent =
    progress && progress.durationSeconds > 0
      ? Math.min(100, (progress.currentSeconds / progress.durationSeconds) * 100)
      : 0;

  return (
    <div className="relative flex aspect-[3/4] items-end overflow-hidden rounded-md bg-secondary shadow-lg shadow-black/25">
      <CoverImage
        src={coverUrl}
        alt={title}
        sizes="(max-width: 640px) 70vw, (max-width: 768px) 40vw, (max-width: 1024px) 25vw, 16vw"
        className="pointer-events-none absolute inset-0 size-full object-cover transition duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:transform-none"
      />
      {percent > 0 ? (
        <div className="absolute inset-x-0 bottom-0 h-1 bg-black/50">
          <div
            className="h-full bg-accent transition-all duration-150"
            style={{ width: `${percent}%` }}
          />
        </div>
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
      <p className="relative line-clamp-3 p-3 text-sm font-black leading-tight text-white">{title}</p>
    </div>
  );
}

type StoryCardProps = {
  series?: SeriesWithRelations | null;
  progress?: { currentSeconds: number; durationSeconds: number } | null;
};

export function StoryCard({ series, progress }: StoryCardProps) {
  if (!series) return <StoryCardSkeleton />;

  const firstEpisode = series.episodes[0];
  const autoBadges = getAutoBadges(series);

  return (
    <article className="group min-w-0 rounded-xl border border-border/80 bg-card/85 p-2.5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-lg hover:shadow-black/30 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <Link href={`/truyen/${series.slug}`} aria-label={series.title}>
        <Cover title={series.title} coverUrl={series.coverUrl} progress={progress} />
      </Link>
      <div className="mt-3 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={series.status === "COMPLETED" ? "accent" : "secondary"}>
            {formatStatus(series.status)}
          </Badge>
          {autoBadges.map((badge) => (
            <Badge key={badge} variant="outline" className="border-accent/50 text-accent">
              {badge}
            </Badge>
          ))}
          {progress ? <Badge variant="secondary">Đang nghe</Badge> : null}
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star aria-hidden="true" className="size-3.5" /> {series.averageRating.toFixed(1)}
          </span>
        </div>
        <Link
          href={`/truyen/${series.slug}`}
          className="line-clamp-2 min-h-10 text-[15px] font-bold leading-5 group-hover:text-accent transition-colors motion-reduce:transition-none"
        >
          {series.title}
        </Link>
        <p className="truncate text-sm text-muted-foreground">{series.producer ?? "Xuong Audio"}</p>
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Headphones aria-hidden="true" className="size-3.5" /> {formatCount(series.listenCount)}
          </span>
          <span>{series.episodeCount} tap</span>
        </div>
        <Button asChild size="sm" className="mt-1 w-full">
          <Link
            href={firstEpisode ? `/truyen/${series.slug}/tap/${firstEpisode.episodeNumber}` : `/truyen/${series.slug}`}
          >
            <Play data-icon="inline-start" />
            Nghe thu
          </Link>
        </Button>
      </div>
    </article>
  );
}

export { StoryCardSkeleton } from "@/components/series/story-card-skeleton";
