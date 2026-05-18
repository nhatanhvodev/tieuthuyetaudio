import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { slug: "ngon-tinh", name: "Ngôn tình" },
  { slug: "tien-hiep", name: "Tiên hiệp" },
  { slug: "kiem-hiep", name: "Kiếm hiệp" },
  { slug: "trinh-tham", name: "Trinh thám" },
  { slug: "do-thi", name: "Đô thị" },
  { slug: "xuyen-khong", name: "Xuyên không" }
];

const audioUrls = [
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
];

const series = [
  {
    slug: "dinh-menh-ben-em",
    title: "Định Mệnh Bên Em",
    coverUrl: "/covers/dinh-menh-ben-em.svg",
    producer: "Xưởng Demo",
    status: "COMPLETED",
    listenCount: 28400,
    averageRating: 4.9,
    categories: ["ngon-tinh", "do-thi"],
    description: "Một câu chuyện tình cảm đô thị được tạo riêng cho dữ liệu demo của ứng dụng nghe truyện."
  },
  {
    slug: "thanh-mai-ngay-ay",
    title: "Thanh Mai Ngày Ấy",
    coverUrl: "/covers/thanh-mai-ngay-ay.svg",
    producer: "Âm Thanh Demo",
    status: "ONGOING",
    listenCount: 7100,
    averageRating: 4.7,
    categories: ["ngon-tinh"],
    description: "Truyện demo về tuổi trẻ, tình bạn và những lựa chọn trưởng thành trong thành phố."
  },
  {
    slug: "kiem-anh-troi-nam",
    title: "Kiếm Ảnh Trời Nam",
    coverUrl: "/covers/kiem-anh-troi-nam.svg",
    producer: "Nam Sơn Voice",
    status: "ONGOING",
    listenCount: 19800,
    averageRating: 4.8,
    categories: ["kiem-hiep"],
    description: "Một hành trình giang hồ giả tưởng với nhân vật, địa danh và tình tiết hoàn toàn demo."
  },
  {
    slug: "mat-ma-pho-cu",
    title: "Mật Mã Phố Cũ",
    coverUrl: "/covers/mat-ma-pho-cu.svg",
    producer: "Phòng Thu Đêm",
    status: "COMPLETED",
    listenCount: 15320,
    averageRating: 4.6,
    categories: ["trinh-tham", "do-thi"],
    description: "Vụ án bí ẩn trong khu phố cũ, nơi mọi dấu vết dẫn tới một bí mật đã bị chôn giấu."
  },
  {
    slug: "tien-lo-ngan-ha",
    title: "Tiên Lộ Ngân Hà",
    coverUrl: "/covers/tien-lo-ngan-ha.svg",
    producer: "Mây Kể Chuyện",
    status: "ONGOING",
    listenCount: 42100,
    averageRating: 4.9,
    categories: ["tien-hiep"],
    description: "Thế giới tu tiên rộng lớn với các tầng trời, pháp bảo và lời hứa từ thuở niên thiếu."
  },
  {
    slug: "quan-ca-phe-thang-sau",
    title: "Quán Cà Phê Tháng Sáu",
    coverUrl: "/covers/quan-ca-phe-thang-sau.svg",
    producer: "Sen Audio",
    status: "COMPLETED",
    listenCount: 9300,
    averageRating: 4.5,
    categories: ["do-thi"],
    description: "Những cuộc gặp gỡ nhẹ nhàng trong một quán cà phê nhỏ, nơi mỗi người để lại một câu chuyện."
  },
  {
    slug: "lac-vao-trieu-dai-la",
    title: "Lạc Vào Triều Đại Lạ",
    coverUrl: "/covers/lac-vao-trieu-dai-la.svg",
    producer: "Cổng Thời Gian",
    status: "ONGOING",
    listenCount: 12780,
    averageRating: 4.4,
    categories: ["xuyen-khong"],
    description: "Một nhân viên văn phòng tỉnh dậy trong một triều đại không có trong lịch sử."
  },
  {
    slug: "nguoi-giu-den-bien",
    title: "Người Giữ Đèn Biển",
    coverUrl: "/covers/nguoi-giu-den-bien.svg",
    producer: "Giọng Cảng Biển",
    status: "COMPLETED",
    listenCount: 22100,
    averageRating: 4.8,
    categories: ["trinh-tham"],
    description: "Ngọn hải đăng cũ và những tín hiệu lạ dẫn một điều tra viên trở lại thị trấn ven biển."
  }
] satisfies Array<{
  slug: string;
  title: string;
  coverUrl: string;
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
      name: "Người dùng demo",
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
        coverUrl: item.coverUrl,
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
        coverUrl: item.coverUrl,
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
          title: `Tập ${episodeNumber}: Chương demo ${episodeNumber}`,
          audioUrl: audioUrls[(episodeNumber - 1) % audioUrls.length],
          durationSeconds: 600 + episodeNumber * 180,
          listenCount: Math.max(100, item.listenCount - episodeNumber * 1200)
        },
        create: {
          seriesId: created.id,
          episodeNumber,
          title: `Tập ${episodeNumber}: Chương demo ${episodeNumber}`,
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
        update: { rating: 5, content: "Truyện demo nghe rất ổn trên mobile." },
        create: { userId: user.id, seriesId: created.id, rating: 5, content: "Truyện demo nghe rất ổn trên mobile." }
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

  console.log(`Đã seed admin ${admin.email} và user ${user.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
