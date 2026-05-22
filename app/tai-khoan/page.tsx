import { requireUser } from "@/lib/auth";
import { getAccountOverview, getFollowedSeries, getListeningHistory } from "@/lib/account/queries";
import { AccountPageClient } from "@/components/account/account-page-client";

export const dynamic = "force-dynamic";

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const session = await requireUser();
  const { tab } = await searchParams;

  const [account, history, follows] = await Promise.all([
    getAccountOverview(session.user.id),
    getListeningHistory(session.user.id),
    getFollowedSeries(session.user.id)
  ]);

  if (!account) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-10">
        <p className="text-muted-foreground">Không tìm thấy tài khoản.</p>
      </section>
    );
  }

  return (
    <AccountPageClient
      tab={tab ?? "profile"}
      account={account}
      history={history}
      follows={follows}
    />
  );
}
