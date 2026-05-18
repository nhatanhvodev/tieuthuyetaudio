import { db } from "@/lib/db";
import { getContinueListeningByUser, seriesInclude } from "@/lib/series/queries";

export async function getAccountOverview(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isVip: true,
      createdAt: true
    }
  });
}

export async function getListeningHistory(userId: string) {
  return db.listenProgress.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      episode: {
        include: {
          series: true
        }
      }
    },
    take: 20
  });
}

export async function getContinueListeningHistory(userId: string, take = 12) {
  return getContinueListeningByUser(userId, take);
}

export async function getFollowedSeries(userId: string) {
  return db.follow.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      series: {
        include: seriesInclude
      }
    }
  });
}
