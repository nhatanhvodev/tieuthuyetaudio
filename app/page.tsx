import Link from "next/link";
import { BookOpen, Crown, Flame, Headphones, Sparkles } from "lucide-react";
import { InstallAppButton } from "@/components/pwa/install-app-button";
import { SearchBox } from "@/components/search/search-box";
import { ContinueListeningShelf } from "@/components/series/continue-listening-shelf";
import { LatestEpisodeList } from "@/components/series/latest-episode-list";
import { StoryShelf } from "@/components/series/story-shelf";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { formatCount } from "@/lib/format";
import { getContinueListeningByUser, getHomeShelves } from "@/lib/series/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth();
  const [shelves, continueListening] = await Promise.all([
    getHomeShelves(),
    session?.user ? getContinueListeningByUser(session.user.id, 6) : Promise.resolve([])
  ]);
  const featured = shelves.popular[0] ?? shelves.latest[0];

  return (
    <>
      <section className="relative overflow-hidden border-b">
        {featured?.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={featured.coverUrl} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover opacity-35" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/92 to-background/45" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1.05fr_0.95fr] md:py-16">
          <div className="flex flex-col justify-center">
            <Badge variant="accent" className="w-fit">Nghe truyen moi luc</Badge>
            <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight md:text-6xl">Tieu thuyet Audio</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              Website nghe truyen audio toi uu cho mobile, co player toan cuc, luu tien trinh nghe va tuy chon cai nhu app tren dien thoai.
            </p>
            <div className="mt-6 max-w-xl">
              <SearchBox />
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/truyen">
                  <BookOpen data-icon="inline-start" />
                  Kham pha ngay
                </Link>
              </Button>
              <InstallAppButton />
              <Button asChild variant="secondary" size="lg">
                <Link href="/vip">
                  <Crown data-icon="inline-start" />
                  Dang ky VIP
                </Link>
              </Button>
            </div>
          </div>

          {featured ? (
            <div className="grid gap-4 md:grid-cols-[0.8fr_1fr] md:items-end">
              <Link href={`/truyen/${featured.slug}`} className="relative aspect-[3/4] overflow-hidden rounded-lg border shadow-2xl shadow-black/40">
                {featured.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={featured.coverUrl} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <Badge variant="accent">Xu huong</Badge>
                  <h2 className="mt-2 line-clamp-2 text-2xl font-black text-white">{featured.title}</h2>
                </div>
              </Link>
              <div className="rounded-lg border bg-card/90 p-4">
                <div className="flex items-center gap-2 text-accent">
                  <Flame aria-hidden="true" />
                  <span className="text-sm font-semibold">Dang duoc nghe nhieu</span>
                </div>
                <p className="mt-3 line-clamp-4 text-sm leading-6 text-muted-foreground">{featured.description}</p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-md bg-secondary p-3">
                    <p className="text-lg font-black">{formatCount(featured.listenCount)}</p>
                    <p className="text-xs text-muted-foreground">luot nghe</p>
                  </div>
                  <div className="rounded-md bg-secondary p-3">
                    <p className="text-lg font-black">{featured.episodeCount}</p>
                    <p className="text-xs text-muted-foreground">tap</p>
                  </div>
                  <div className="rounded-md bg-secondary p-3">
                    <p className="text-lg font-black">{featured.averageRating.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">diem</p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {session?.user ? <ContinueListeningShelf items={continueListening} title="Nghe tiep" href="/tai-khoan" /> : null}

      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {shelves.categories.map((category) => (
            <Link key={category.id} href={`/the-loai/${category.slug}`} className="inline-flex h-10 shrink-0 items-center gap-2 rounded-md border bg-card px-4 text-sm font-semibold text-muted-foreground hover:border-accent hover:text-foreground">
              <Sparkles aria-hidden="true" className="size-4 text-accent" />
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      <StoryShelf title="Xu huong hom nay" href="/truyen?sort=popular" items={shelves.popular} />

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black">Tap moi cap nhat</h2>
            <Link href="/truyen?sort=newest" className="text-sm font-semibold text-accent">Xem thu vien</Link>
          </div>
          <LatestEpisodeList episodes={shelves.latestEpisodes} />
        </div>
        <aside className="rounded-lg border bg-card/90 p-5">
          <div className="flex items-center gap-2 text-accent">
            <Headphones aria-hidden="true" />
            <h2 className="text-xl font-black">Nghe tiep tren mobile</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Cai website nhu ung dung de mo nhanh tu man hinh chinh, giu player va tiep tuc nghe bo truyen dang theo doi.
          </p>
          <div className="mt-5">
            <InstallAppButton />
          </div>
        </aside>
      </section>

      <StoryShelf title="Truyen moi len ke" href="/truyen?sort=newest" items={shelves.latest} />
      <StoryShelf title="Co the ban se thich" href="/truyen?sort=rating" items={shelves.recommended} />
    </>
  );
}
