# codex.md — Prompt cho Codex AI Agent tạo website truyện audio tương tự

## Vai trò

Bạn là Codex AI Agent, hãy xây dựng một website nghe truyện audio tiếng Việt có giao diện và chức năng tương tự `truyenaudio25.com`, nhưng dùng dữ liệu demo hoặc dữ liệu thuộc quyền sở hữu của tôi. Không sao chép logo, thương hiệu, nội dung bản quyền hoặc audio không được phép.

## Mục tiêu sản phẩm

Xây dựng web app nghe truyện audio với các chức năng:

- Trang chủ hiển thị truyện nổi bật, truyện mới, truyện đề xuất.
- Trang danh sách truyện `/series`.
- Lọc truyện theo thể loại/category.
- Trang chi tiết truyện `/series/[slug]`.
- Danh sách tập audio.
- Audio player nghe thử/nghe tập.
- Theo dõi truyện.
- Chia sẻ truyện.
- Đánh giá/rating truyện.
- Tìm kiếm truyện.
- Trang tài khoản người dùng.
- Trang cộng đồng/góp ý.
- Responsive tốt trên desktop, tablet, mobile.

## Tech stack đề xuất

Ưu tiên stack sau:

- Next.js 15 App Router.
- TypeScript.
- Tailwind CSS.
- shadcn/ui.
- Prisma ORM.
- PostgreSQL.
- NextAuth hoặc Auth.js.
- Upload/audio storage: S3 compatible hoặc Cloudinary video/audio.
- Player: HTML5 `<audio>` custom UI.

Nếu project hiện tại đã có stack khác thì giữ stack hiện tại và chỉ bổ sung chức năng tương ứng.

---

## Cấu trúc route

```txt
/
/series
/series/[slug]
/categories
/categories/[slug]
/search?q=
/account
/login
/register
/community
/admin
/admin/series
/admin/series/new
/admin/series/[id]/edit
/admin/episodes
```

---

## Cấu trúc database Prisma

Tạo hoặc cập nhật `prisma/schema.prisma`:

```prisma
model User {
  id            String     @id @default(cuid())
  email         String     @unique
  name          String?
  passwordHash  String?
  role          UserRole   @default(USER)
  follows       Follow[]
  reviews       Review[]
  progresses    ListenProgress[]
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
}

enum UserRole {
  USER
  ADMIN
}

model Series {
  id             String           @id @default(cuid())
  slug           String           @unique
  title          String
  description    String?
  coverUrl       String?
  producer       String?
  status         SeriesStatus     @default(ONGOING)
  listenCount    Int              @default(0)
  episodeCount   Int              @default(0)
  averageRating  Float            @default(0)
  episodes       Episode[]
  categories     SeriesCategory[]
  follows        Follow[]
  reviews        Review[]
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt
}

enum SeriesStatus {
  ONGOING
  COMPLETED
}

model Episode {
  id              String           @id @default(cuid())
  seriesId        String
  series          Series           @relation(fields: [seriesId], references: [id], onDelete: Cascade)
  episodeNumber   Int
  title           String
  audioUrl        String?
  durationSeconds Int?
  listenCount     Int              @default(0)
  progresses      ListenProgress[]
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  @@unique([seriesId, episodeNumber])
}

model Category {
  id        String           @id @default(cuid())
  slug      String           @unique
  name      String
  series    SeriesCategory[]
  createdAt DateTime         @default(now())
}

model SeriesCategory {
  seriesId   String
  categoryId String
  series     Series   @relation(fields: [seriesId], references: [id], onDelete: Cascade)
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@id([seriesId, categoryId])
}

model Follow {
  id        String   @id @default(cuid())
  userId    String
  seriesId  String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  series    Series   @relation(fields: [seriesId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([userId, seriesId])
}

model Review {
  id        String   @id @default(cuid())
  userId    String
  seriesId  String
  rating    Int
  content   String?
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  series    Series   @relation(fields: [seriesId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([userId, seriesId])
}

model ListenProgress {
  id              String   @id @default(cuid())
  userId          String
  episodeId       String
  currentSeconds  Int      @default(0)
  completed       Boolean  @default(false)
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  episode         Episode  @relation(fields: [episodeId], references: [id], onDelete: Cascade)
  updatedAt       DateTime @updatedAt

  @@unique([userId, episodeId])
}
```

---

## UI/UX yêu cầu

### Layout tổng thể

- Header cố định hoặc sticky:
  - Logo/tên web.
  - Menu: Trang chủ, Danh sách truyện, Thể loại, Cộng đồng.
  - Search box.
  - Nút đăng nhập/tài khoản.
- Sidebar hoặc dropdown thể loại.
- Footer:
  - Liên hệ.
  - Giới thiệu.
  - Chính sách.
  - Điều khoản.

### Trang chủ

Các section:

1. Hero/banner:
   - Text: “Nghe truyện audio mọi lúc mọi nơi”.
   - Search lớn.
2. Truyện mới cập nhật.
3. Truyện thịnh hành.
4. Có thể bạn sẽ thích.
5. Tác giả/nhà sản xuất nổi bật.
6. Thể loại phổ biến.

### Card truyện

Mỗi card cần có:

- Ảnh cover.
- Tên truyện.
- Nhà sản xuất.
- Trạng thái: Hoàn thành / Đang cập nhật.
- Lượt nghe.
- Số tập.
- Rating.
- Nút “Nghe thử”.

### Trang danh sách truyện

- Grid responsive.
- Filter:
  - Category.
  - Trạng thái.
  - Số tập.
  - Sắp xếp: mới nhất, nghe nhiều, rating cao.
- Pagination hoặc infinite scroll.

### Trang chi tiết truyện

Bố cục:

- Cover bên trái.
- Thông tin bên phải:
  - Tên truyện.
  - Nhà sản xuất.
  - Lượt nghe.
  - Số tập.
  - Rating.
  - Trạng thái.
- Nút:
  - Nghe thử.
  - Theo dõi.
  - Chia sẻ.
- Tabs:
  - Danh sách tập.
  - Mô tả.
  - Đánh giá.

### Audio player

Tạo component `AudioPlayer`:

- Play/pause.
- Thanh progress.
- Current time / duration.
- Tua tiến/lùi 10 giây.
- Điều chỉnh tốc độ: 0.75x, 1x, 1.25x, 1.5x, 2x.
- Volume.
- Lưu tiến trình nghe nếu user đăng nhập.
- Mini-player cố định dưới màn hình khi đang phát.

---

## API routes cần tạo

```txt
GET    /api/series
POST   /api/series
GET    /api/series/[slug]
PATCH  /api/series/[id]
DELETE /api/series/[id]

GET    /api/series/[slug]/episodes
POST   /api/episodes
PATCH  /api/episodes/[id]
DELETE /api/episodes/[id]

GET    /api/categories
POST   /api/categories

POST   /api/follow
DELETE /api/follow

POST   /api/reviews
PATCH  /api/reviews/[id]
DELETE /api/reviews/[id]

POST   /api/progress
GET    /api/search?q=
```

---

## Component cần tạo

```txt
components/layout/Header.tsx
components/layout/Footer.tsx
components/layout/MobileNav.tsx
components/series/SeriesCard.tsx
components/series/SeriesGrid.tsx
components/series/SeriesFilters.tsx
components/series/EpisodeList.tsx
components/audio/AudioPlayer.tsx
components/audio/MiniPlayer.tsx
components/review/RatingStars.tsx
components/review/ReviewForm.tsx
components/search/SearchBox.tsx
components/common/EmptyState.tsx
components/common/Loading.tsx
```

---

## Seed data demo

Tạo seed demo, không dùng nội dung bản quyền thật:

```ts
const categories = [
  'Ngôn tình',
  'Tiên hiệp',
  'Kiếm hiệp',
  'Hài hước',
  'Trinh thám',
  'Đô thị',
  'Tổng tài',
  'Trọng sinh',
  'Xuyên không',
  'Hắc bang'
];

const demoSeries = [
  {
    title: 'Định Mệnh Bên Em',
    slug: 'dinh-menh-ben-em',
    producer: 'Demo Studio',
    status: 'COMPLETED',
    listenCount: 28400,
    episodeCount: 20,
    averageRating: 5,
    description: 'Một câu chuyện tình cảm đô thị được dựng lại bằng dữ liệu demo.',
    coverUrl: '/demo/covers/dinh-menh-ben-em.jpg'
  },
  {
    title: 'Thanh Mai Ngày Ấy',
    slug: 'thanh-mai-ngay-ay',
    producer: 'Demo Audio',
    status: 'ONGOING',
    listenCount: 7100,
    episodeCount: 14,
    averageRating: 4.8,
    description: 'Truyện demo về tuổi trẻ, tình bạn và lựa chọn trưởng thành.',
    coverUrl: '/demo/covers/thanh-mai-ngay-ay.jpg'
  }
];
```

---

## Yêu cầu code chất lượng

- TypeScript strict mode.
- Server components cho dữ liệu tĩnh/danh sách.
- Client components cho player, filter động, form.
- Tách service/database logic khỏi UI.
- Validate input bằng Zod.
- Có loading, error state, empty state.
- Có responsive mobile-first.
- Có dark mode.
- Có SEO metadata cho từng trang truyện.
- Không hardcode dữ liệu trong component, dùng API/database/seed.

---

## Quy trình triển khai từng bước

1. Kiểm tra project hiện tại.
2. Cài dependencies cần thiết.
3. Tạo Prisma schema và migration.
4. Tạo seed data.
5. Tạo layout chính.
6. Tạo trang chủ.
7. Tạo trang danh sách truyện + filter.
8. Tạo trang chi tiết truyện.
9. Tạo audio player.
10. Tạo auth user.
11. Tạo follow/review/progress.
12. Tạo admin CRUD.
13. Test responsive.
14. Fix lỗi TypeScript/build.
15. Tối ưu SEO và performance.

---

## Prompt hành động cho Codex

Hãy bắt đầu bằng cách đọc toàn bộ cấu trúc project hiện tại. Sau đó triển khai website truyện audio theo yêu cầu trên. Nếu project chưa có Next.js thì tạo mới Next.js + TypeScript + Tailwind + Prisma + PostgreSQL. Nếu project đã có sẵn framework khác, hãy giữ framework đó và triển khai tương đương.

Ưu tiên hoàn thành MVP trước:

1. Home page.
2. Series list.
3. Series detail.
4. Episode list.
5. Audio player.
6. Search/filter.
7. Database schema + seed.

Sau khi code xong, chạy:

```bash
npm run lint
npm run build
```

Nếu lỗi, tự sửa đến khi build thành công. Ghi lại các file đã thay đổi và hướng dẫn chạy local.
