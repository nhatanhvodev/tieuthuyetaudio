import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

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

const series = [
  {
    slug: "dinh-menh-ben-em",
    title: "Dinh Menh Ben Em",
    producer: "Demo Studio",
    status: "COMPLETED",
    listenCount: 28400,
    averageRating: 4.9,
    categories: ["ngon-tinh", "do-thi"],
    description: "Mot cau chuyen tinh cam do thi duoc tao rieng cho du lieu demo cua ung dung nghe truyen."
  },
  {
    slug: "thanh-mai-ngay-ay",
    title: "Thanh Mai Ngay Ay",
    producer: "Demo Audio",
    status: "ONGOING",
    listenCount: 7100,
    averageRating: 4.7,
    categories: ["ngon-tinh"],
    description: "Truyen demo ve tuoi tre, tinh ban va nhung lua chon truong thanh trong thanh pho."
  },
  {
    slug: "kiem-anh-troi-nam",
    title: "Kiem Anh Troi Nam",
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
    producer: "Noir Lab",
    status: "COMPLETED",
    listenCount: 15320,
    averageRating: 4.6,
    categories: ["trinh-tham", "do-thi"],
    description: "Vu an bi an trong khu pho cu, noi moi dau vet dan toi mot bi mat da bi chon giau."
  },
  {
    slug: "tien-lo-ngan-ha",
    title: "Tien Lo Ngan Ha",
    producer: "Cloud Tale",
    status: "ONGOING",
    listenCount: 42100,
    averageRating: 4.9,
    categories: ["tien-hiep"],
    description: "The gioi tu tien rong lon voi cac tang troi, phap bao va loi hua tu thuo nien thieu."
  },
  {
    slug: "quan-ca-phe-thang-sau",
    title: "Quan Ca Phe Thang Sau",
    producer: "Lotus Audio",
    status: "COMPLETED",
    listenCount: 9300,
    averageRating: 4.5,
    categories: ["do-thi"],
    description: "Nhung cuoc gap go nhe nhang trong mot quan ca phe nho, noi moi nguoi de lai mot cau chuyen."
  },
  {
    slug: "lac-vao-trieu-dai-la",
    title: "Lac Vao Trieu Dai La",
    producer: "Time Gate",
    status: "ONGOING",
    listenCount: 12780,
    averageRating: 4.4,
    categories: ["xuyen-khong"],
    description: "Mot nhan vien van phong tinh day trong mot trieu dai khong co trong lich su."
  },
  {
    slug: "nguoi-giu-den-bien",
    title: "Nguoi Giu Den Bien",
    producer: "Harbor Voice",
    status: "COMPLETED",
    listenCount: 22100,
    averageRating: 4.8,
    categories: ["trinh-tham"],
    description: "Ngon hai dang cu va nhung tin hieu la dan mot dieu tra vien tro lai thi tran ven bien."
  }
] satisfies Array<{
  slug: string;
  title: string;
  producer: string;
  status: "ONGOING" | "COMPLETED";
  listenCount: number;
  averageRating: number;
  categories: string[];
  description: string;
}>;

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@tieuthuyetaudio.local" },
    update: {},
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
    update: {},
    create: {
      email: "user@tieuthuyetaudio.local",
      name: "Demo User",
      passwordHash: await bcrypt.hash("User@123456", 12),
      role: "USER",
      isVip: false
    }
  });

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category
    });
  }

  for (const [index, item] of series.entries()) {
    const created = await prisma.series.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        description: item.description,
        producer: item.producer,
        status: item.status,
        listenCount: item.listenCount,
        averageRating: item.averageRating,
        episodeCount: 3
      },
      create: {
        slug: item.slug,
        title: item.title,
        description: item.description,
        producer: item.producer,
        status: item.status,
        listenCount: item.listenCount,
        averageRating: item.averageRating,
        episodeCount: 3
      }
    });

    for (const categorySlug of item.categories) {
      const category = await prisma.category.findUniqueOrThrow({ where: { slug: categorySlug } });
      await prisma.seriesCategory.upsert({
        where: { seriesId_categoryId: { seriesId: created.id, categoryId: category.id } },
        update: {},
        create: { seriesId: created.id, categoryId: category.id }
      });
    }

    for (let episodeNumber = 1; episodeNumber <= 3; episodeNumber++) {
      await prisma.episode.upsert({
        where: { seriesId_episodeNumber: { seriesId: created.id, episodeNumber } },
        update: {
          title: `Tap ${episodeNumber}: Chuong demo ${episodeNumber}`,
          audioUrl: audioUrls[(episodeNumber - 1) % audioUrls.length],
          durationSeconds: 600 + episodeNumber * 180,
          listenCount: Math.max(100, item.listenCount - episodeNumber * 1200)
        },
        create: {
          seriesId: created.id,
          episodeNumber,
          title: `Tap ${episodeNumber}: Chuong demo ${episodeNumber}`,
          audioUrl: audioUrls[(episodeNumber - 1) % audioUrls.length],
          durationSeconds: 600 + episodeNumber * 180,
          listenCount: Math.max(100, item.listenCount - episodeNumber * 1200)
        }
      });
    }

    if (index < 3) {
      await prisma.follow.upsert({
        where: { userId_seriesId: { userId: user.id, seriesId: created.id } },
        update: {},
        create: { userId: user.id, seriesId: created.id }
      });

      await prisma.review.upsert({
        where: { userId_seriesId: { userId: user.id, seriesId: created.id } },
        update: { rating: 5, content: "Truyen demo nghe rat on tren mobile." },
        create: { userId: user.id, seriesId: created.id, rating: 5, content: "Truyen demo nghe rat on tren mobile." }
      });
    }
  }

  const firstEpisode = await prisma.episode.findFirst({ orderBy: { createdAt: "asc" } });
  if (firstEpisode) {
    await prisma.listenProgress.upsert({
      where: { userId_episodeId: { userId: user.id, episodeId: firstEpisode.id } },
      update: { currentSeconds: 240, completed: false },
      create: { userId: user.id, episodeId: firstEpisode.id, currentSeconds: 240, completed: false }
    });
  }

  console.log(`Seeded admin ${admin.email} and user ${user.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
