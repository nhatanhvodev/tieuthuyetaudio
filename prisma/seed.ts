import bcrypt from "bcryptjs";
import { PrismaClient, type SeriesStatus } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { slug: "ngon-tinh", name: "Ngon tinh" },
  { slug: "tien-hiep", name: "Tien hiep" },
  { slug: "kiem-hiep", name: "Kiem hiep" },
  { slug: "trinh-tham", name: "Trinh tham" },
  { slug: "do-thi", name: "Do thi" },
  { slug: "xuyen-khong", name: "Xuyen khong" }
];

const audioUrls = [
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
];

type SeedSeries = {
  slug: string;
  title: string;
  coverUrl: string;
  producer: string;
  status: SeriesStatus;
  listenCount: number;
  averageRating: number;
  categories: readonly string[];
  description: string;
};

const baseSeries: SeedSeries[] = [
  {
    slug: "dinh-menh-ben-em",
    title: "Dinh Menh Ben Em",
    coverUrl: "/covers/dinh-menh-ben-em.svg",
    producer: "Xuong Demo",
    status: "COMPLETED",
    listenCount: 28400,
    averageRating: 4.9,
    categories: ["ngon-tinh", "do-thi"],
    description: "Mot cau chuyen tinh cam do thi duoc tao rieng cho du lieu demo cua ung dung nghe truyen."
  },
  {
    slug: "thanh-mai-ngay-ay",
    title: "Thanh Mai Ngay Ay",
    coverUrl: "/covers/thanh-mai-ngay-ay.svg",
    producer: "Am Thanh Demo",
    status: "ONGOING",
    listenCount: 7100,
    averageRating: 4.7,
    categories: ["ngon-tinh"],
    description: "Truyen demo ve tuoi tre, tinh ban va nhung lua chon truong thanh trong thanh pho."
  },
  {
    slug: "kiem-anh-troi-nam",
    title: "Kiem Anh Troi Nam",
    coverUrl: "/covers/kiem-anh-troi-nam.svg",
    producer: "Nam Son Voice",
    status: "ONGOING",
    listenCount: 19800,
    averageRating: 4.8,
    categories: ["kiem-hiep"],
    description: "Mot hanh trinh giang ho gia tuong voi nhan vat, dia danh va tinh tiet hoan toan demo."
  },
  {
    slug: "mat-ma-pho-cu",
    title: "Mat Ma Pho Cu",
    coverUrl: "/covers/mat-ma-pho-cu.svg",
    producer: "Phong Thu Dem",
    status: "COMPLETED",
    listenCount: 15320,
    averageRating: 4.6,
    categories: ["trinh-tham", "do-thi"],
    description: "Vu an bi an trong khu pho cu, noi moi dau vet dan toi mot bi mat da bi chon giau."
  },
  {
    slug: "tien-lo-ngan-ha",
    title: "Tien Lo Ngan Ha",
    coverUrl: "/covers/tien-lo-ngan-ha.svg",
    producer: "May Ke Chuyen",
    status: "ONGOING",
    listenCount: 42100,
    averageRating: 4.9,
    categories: ["tien-hiep"],
    description: "The gioi tu tien rong lon voi cac tang troi, phap bao va loi hua tu thu nien thieu."
  },
  {
    slug: "quan-ca-phe-thang-sau",
    title: "Quan Ca Phe Thang Sau",
    coverUrl: "/covers/quan-ca-phe-thang-sau.svg",
    producer: "Sen Audio",
    status: "COMPLETED",
    listenCount: 9300,
    averageRating: 4.5,
    categories: ["do-thi"],
    description: "Nhung cuoc gap go nhe nhang trong mot quan ca phe nho, noi moi nguoi de lai mot cau chuyen."
  },
  {
    slug: "lac-vao-trieu-dai-la",
    title: "Lac Vao Trieu Dai La",
    coverUrl: "/covers/lac-vao-trieu-dai-la.svg",
    producer: "Cong Thoi Gian",
    status: "ONGOING",
    listenCount: 12780,
    averageRating: 4.4,
    categories: ["xuyen-khong"],
    description: "Mot nhan vien van phong tinh day trong mot trieu dai khong co trong lich su."
  },
  {
    slug: "nguoi-giu-den-bien",
    title: "Nguoi Giu Den Bien",
    coverUrl: "/covers/nguoi-giu-den-bien.svg",
    producer: "Giong Cang Bien",
    status: "COMPLETED",
    listenCount: 22100,
    averageRating: 4.8,
    categories: ["trinh-tham"],
    description: "Ngon hai dang cu va nhung tin hieu la dan mot dieu tra vien tro lai thi tran ven bien."
  }
];

const generatedSeries: SeedSeries[] = Array.from({ length: 16 }, (_, index) => {
  const primaryCategory = categories[index % categories.length];
  const secondaryCategory = categories[(index + 2) % categories.length];
  const coverSource = baseSeries[index % baseSeries.length];
  const status: SeriesStatus = index % 3 === 0 ? "COMPLETED" : "ONGOING";

  return {
    slug: `demo-series-${index + 1}`,
    title: `Demo Series ${index + 1}`,
    coverUrl: coverSource.coverUrl,
    producer: `Studio ${index + 1}`,
    status,
    listenCount: 4200 + index * 1850,
    averageRating: Number((4.1 + (index % 5) * 0.15).toFixed(1)),
    categories: [primaryCategory.slug, secondaryCategory.slug],
    description: `Bo truyen mo rong ${index + 1} duoc tao de kiem thu recommendation, ranking va latency local.`
  };
});

const allSeries = [...baseSeries, ...generatedSeries];

function pickAudioUrl(index: number) {
  return audioUrls[index % audioUrls.length];
}

function categoryNamesForSeries(seriesCategories: readonly string[]) {
  return seriesCategories.map((slug) => categories.find((item) => item.slug === slug)?.name ?? slug).join(", ");
}

async function upsertUsers() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@tieuthuyetaudio.local" },
    update: {
      name: "Admin",
      role: "ADMIN",
      isVip: true
    },
    create: {
      email: "admin@tieuthuyetaudio.local",
      name: "Admin",
      passwordHash: await bcrypt.hash("Admin@123456", 12),
      role: "ADMIN",
      isVip: true
    }
  });

  const user = await prisma.user.upsert({
    where: { email: "user@tieuthuyetaudio.local" },
    update: {
      name: "Nguoi dung demo",
      role: "USER",
      isVip: false
    },
    create: {
      email: "user@tieuthuyetaudio.local",
      name: "Nguoi dung demo",
      passwordHash: await bcrypt.hash("User@123456", 12),
      role: "USER",
      isVip: false
    }
  });

  const listeners = [] as Array<{ id: string; email: string; isVip: boolean }>;
  for (let index = 0; index < 12; index += 1) {
    const isVip = index % 4 === 0;
    const email = `listener${index + 1}@tieuthuyetaudio.local`;
    const listener = await prisma.user.upsert({
      where: { email },
      update: {
        name: `Listener ${index + 1}`,
        isVip
      },
      create: {
        email,
        name: `Listener ${index + 1}`,
        passwordHash: await bcrypt.hash(`Listener@${index + 1}23456`, 12),
        role: "USER",
        isVip
      }
    });
    listeners.push({ id: listener.id, email: listener.email, isVip: listener.isVip });
  }

  return { admin, user, listeners };
}

async function upsertCategories() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category
    });
  }
}

async function upsertCatalog() {
  const seriesIdsBySlug = new Map<string, string>();

  for (const [seriesIndex, item] of allSeries.entries()) {
    const episodeCount = seriesIndex < baseSeries.length ? 6 : 5;
    const created = await prisma.series.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        description: item.description,
        coverUrl: item.coverUrl,
        producer: item.producer,
        status: item.status,
        listenCount: item.listenCount,
        averageRating: item.averageRating,
        episodeCount
      },
      create: {
        slug: item.slug,
        title: item.title,
        description: item.description,
        coverUrl: item.coverUrl,
        producer: item.producer,
        status: item.status,
        listenCount: item.listenCount,
        averageRating: item.averageRating,
        episodeCount
      }
    });

    seriesIdsBySlug.set(item.slug, created.id);

    for (const categorySlug of item.categories) {
      const category = await prisma.category.findUniqueOrThrow({ where: { slug: categorySlug } });
      await prisma.seriesCategory.upsert({
        where: { seriesId_categoryId: { seriesId: created.id, categoryId: category.id } },
        update: {},
        create: { seriesId: created.id, categoryId: category.id }
      });
    }

    for (let episodeNumber = 1; episodeNumber <= episodeCount; episodeNumber += 1) {
      const isPremium = (seriesIndex < 4 && episodeNumber >= 5) || (seriesIndex >= baseSeries.length && seriesIndex % 3 === 0 && episodeNumber === episodeCount);
      await prisma.episode.upsert({
        where: { seriesId_episodeNumber: { seriesId: created.id, episodeNumber } },
        update: {
          title: `Tap ${episodeNumber}: Chuong demo ${episodeNumber}`,
          audioUrl: pickAudioUrl(seriesIndex + episodeNumber - 1),
          durationSeconds: 720 + episodeNumber * 150,
          listenCount: Math.max(120, item.listenCount - episodeNumber * 860),
          isPremium
        },
        create: {
          seriesId: created.id,
          episodeNumber,
          title: `Tap ${episodeNumber}: Chuong demo ${episodeNumber}`,
          audioUrl: pickAudioUrl(seriesIndex + episodeNumber - 1),
          durationSeconds: 720 + episodeNumber * 150,
          listenCount: Math.max(120, item.listenCount - episodeNumber * 860),
          isPremium
        }
      });
    }
  }

  return seriesIdsBySlug;
}

async function attachUserActivity(userId: string, favoriteCategoryOffset: number) {
  const preferredCategories = [
    categories[favoriteCategoryOffset % categories.length].slug,
    categories[(favoriteCategoryOffset + 2) % categories.length].slug
  ];

  const matchingSeries = allSeries.filter((item) => item.categories.some((categorySlug) => preferredCategories.includes(categorySlug))).slice(0, 5);

  for (const [seriesIndex, item] of matchingSeries.entries()) {
    const series = await prisma.series.findUniqueOrThrow({ where: { slug: item.slug } });
    await prisma.follow.upsert({
      where: { userId_seriesId: { userId, seriesId: series.id } },
      update: {},
      create: { userId, seriesId: series.id }
    });

    await prisma.review.upsert({
      where: { userId_seriesId: { userId, seriesId: series.id } },
      update: {
        rating: 4 + ((favoriteCategoryOffset + seriesIndex) % 2),
        content: `Theo doi bo nay vi hop gu ${categoryNamesForSeries(item.categories)}.`
      },
      create: {
        userId,
        seriesId: series.id,
        rating: 4 + ((favoriteCategoryOffset + seriesIndex) % 2),
        content: `Theo doi bo nay vi hop gu ${categoryNamesForSeries(item.categories)}.`
      }
    });

    const episodes = await prisma.episode.findMany({ where: { seriesId: series.id }, orderBy: { episodeNumber: "asc" } });
    for (const [episodeIndex, episode] of episodes.slice(0, 3).entries()) {
      const currentSeconds = 150 + favoriteCategoryOffset * 20 + seriesIndex * 35 + episodeIndex * 80;
      const completed = episodeIndex === 0 && seriesIndex < 2;
      await prisma.listenProgress.upsert({
        where: { userId_episodeId: { userId, episodeId: episode.id } },
        update: { currentSeconds, completed },
        create: { userId, episodeId: episode.id, currentSeconds, completed }
      });
    }
  }
}

async function seedPrimaryUser(userId: string) {
  const targetSlugs = [
    "dinh-menh-ben-em",
    "thanh-mai-ngay-ay",
    "quan-ca-phe-thang-sau",
    "demo-series-1",
    "demo-series-7"
  ];

  for (const slug of targetSlugs) {
    const series = await prisma.series.findUniqueOrThrow({ where: { slug } });
    await prisma.follow.upsert({
      where: { userId_seriesId: { userId, seriesId: series.id } },
      update: {},
      create: { userId, seriesId: series.id }
    });
  }

  const progressPlan = [
    { slug: "dinh-menh-ben-em", episodeNumber: 1, currentSeconds: 540, completed: true },
    { slug: "dinh-menh-ben-em", episodeNumber: 2, currentSeconds: 420, completed: false },
    { slug: "thanh-mai-ngay-ay", episodeNumber: 1, currentSeconds: 610, completed: true },
    { slug: "quan-ca-phe-thang-sau", episodeNumber: 1, currentSeconds: 265, completed: false },
    { slug: "demo-series-1", episodeNumber: 2, currentSeconds: 430, completed: false },
    { slug: "demo-series-7", episodeNumber: 1, currentSeconds: 700, completed: true }
  ];

  for (const plan of progressPlan) {
    const series = await prisma.series.findUniqueOrThrow({ where: { slug: plan.slug } });
    const episode = await prisma.episode.findUniqueOrThrow({
      where: { seriesId_episodeNumber: { seriesId: series.id, episodeNumber: plan.episodeNumber } }
    });
    await prisma.listenProgress.upsert({
      where: { userId_episodeId: { userId, episodeId: episode.id } },
      update: { currentSeconds: plan.currentSeconds, completed: plan.completed },
      create: { userId, episodeId: episode.id, currentSeconds: plan.currentSeconds, completed: plan.completed }
    });
  }

  const bookmarkEpisode = await prisma.episode.findFirst({
    where: { series: { slug: "dinh-menh-ben-em" }, episodeNumber: 2 }
  });
  if (bookmarkEpisode) {
    await prisma.bookmark.upsert({
      where: { id: `bookmark-${userId}-${bookmarkEpisode.id}` },
      update: { note: "Doan cao trao can nghe lai", second: 312 },
      create: {
        id: `bookmark-${userId}-${bookmarkEpisode.id}`,
        userId,
        episodeId: bookmarkEpisode.id,
        second: 312,
        note: "Doan cao trao can nghe lai"
      }
    });
  }
}

async function main() {
  const { admin, user, listeners } = await upsertUsers();
  await upsertCategories();
  await upsertCatalog();
  await seedPrimaryUser(user.id);

  for (const [index, listener] of listeners.entries()) {
    await attachUserActivity(listener.id, index);
  }

  console.log(`Seeded catalog=${allSeries.length} users=${listeners.length + 2} admin=${admin.email} user=${user.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
