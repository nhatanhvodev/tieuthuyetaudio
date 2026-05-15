import { InstallAppButton } from "@/components/pwa/install-app-button";
import { SearchBox } from "@/components/search/search-box";
import { StoryShelf } from "@/components/series/story-shelf";
import { Button } from "@/components/ui/button";
import { getHomeShelves } from "@/lib/series/queries";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const shelves = await getHomeShelves();

  return (
    <>
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1.05fr_0.95fr] md:py-20">
        <div className="flex flex-col justify-center">
          <h1 className="max-w-3xl text-4xl font-black leading-tight md:text-6xl">Nghe tiep cau chuyen dang do</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
            Thu vien tieu thuyet audio toi uu cho mobile, co player noi, tien trinh nghe va tuy chon cai nhu app.
          </p>
          <div className="mt-6 max-w-xl">
            <SearchBox />
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <InstallAppButton />
            <Button asChild variant="secondary">
              <Link href="/truyen">Duyet thu vien</Link>
            </Button>
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-4 shadow-2xl shadow-black/20">
          <div className="grid grid-cols-3 items-end gap-3">
            <div className="h-40 rounded-lg bg-amber-500" />
            <div className="h-56 rounded-lg bg-teal-400" />
            <div className="h-44 rounded-lg bg-violet-500" />
          </div>
          <div className="mt-5 rounded-xl bg-secondary p-4">
            <div className="mb-3 h-3 w-2/3 rounded bg-foreground/80" />
            <div className="h-2 rounded-full bg-background">
              <div className="h-2 w-1/2 rounded-full bg-primary" />
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-4">
        <div className="rounded-xl border bg-secondary/70 p-4 md:p-6">
          <h2 className="text-xl font-black">Nghe tiep</h2>
          <p className="mt-2 text-sm text-muted-foreground">Dang nhap de dong bo tien trinh nghe tren web va app cai dat tu mobile.</p>
        </div>
      </section>
      <StoryShelf title="Truyen moi cap nhat" href="/truyen?sort=newest" items={shelves.latest} />
      <StoryShelf title="Dang thinh hanh" href="/truyen?sort=popular" items={shelves.popular} />
      <StoryShelf title="Co the ban se thich" href="/truyen?sort=rating" items={shelves.recommended} />
    </>
  );
}
