import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContinueListeningShelf } from "@/components/series/continue-listening-shelf";
import { requireUser } from "@/lib/auth";
import { formatDuration } from "@/lib/format";
import { getAccountOverview, getContinueListeningHistory, getFollowedSeries, getListeningHistory } from "@/lib/account/queries";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await requireUser();
  const [account, history, follows, continueListening] = await Promise.all([
    getAccountOverview(session.user.id),
    getListeningHistory(session.user.id),
    getFollowedSeries(session.user.id),
    getContinueListeningHistory(session.user.id, 8)
  ]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-4xl font-black">Tai khoan</h1>

      <ContinueListeningShelf items={continueListening} title="Nghe tiep" />

      <div className="mt-8 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>{account?.name ?? session.user.email}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">{account?.email}</p>
            <div className="flex gap-2">
              <Badge>{account?.role}</Badge>
              <Badge variant={account?.isVip ? "accent" : "secondary"}>{account?.isVip ? "VIP" : "Mien phi"}</Badge>
            </div>
            <Button asChild variant="secondary"><Link href="/vip">Xem VIP</Link></Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Lich su nghe</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            {history.length ? history.map((item) => (
              <div key={item.id} className="rounded-md border p-3">
                <Link href={`/truyen/${item.episode.series.slug}/tap/${item.episode.episodeNumber}`} className="font-semibold">
                  {item.episode.series.title} - {item.episode.title}
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">Da nghe {formatDuration(item.currentSeconds)}</p>
                <Button asChild size="sm" className="mt-2">
                  <Link href={`/truyen/${item.episode.series.slug}/tap/${item.episode.episodeNumber}`}>Tiep tuc nghe</Link>
                </Button>
              </div>
            )) : <p className="text-muted-foreground">Chua co lich su nghe.</p>}
          </CardContent>
        </Card>
      </div>
      <Card className="mt-5">
        <CardHeader><CardTitle>Truyen dang theo doi</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {follows.length ? follows.map((follow) => (
            <Link key={follow.id} href={`/truyen/${follow.series.slug}`} className="rounded-md border p-3 font-semibold">
              {follow.series.title}
            </Link>
          )) : <p className="text-muted-foreground">Chua theo doi truyen nao.</p>}
        </CardContent>
      </Card>
    </section>
  );
}
