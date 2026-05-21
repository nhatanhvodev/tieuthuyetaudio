# Tiểu thuyết Audio

Website nghe truyện audio tiếng Việt, tối ưu cho mobile, có player toàn cục, lưu tiến trình nghe, gợi ý cá nhân hóa và hỗ trợ cài như PWA.

## Công nghệ

- **Framework:** Next.js 15 (App Router, Server Components)
- **UI:** React 19, Tailwind CSS 4, daisyUI 5, Radix UI
- **Auth:** NextAuth 5 (beta) với Credentials provider, JWT session
- **Database:** PostgreSQL + Prisma ORM 6
- **State:** Zustand (player store), React Server Components (page data)
- **Validation:** Zod (API + forms)
- **Kiểm thử:** Vitest (unit), Playwright (E2E)
- **Deploy:** Node.js runtime (tối ưu cho VPS tự quản)

## Tính năng

### Người dùng
- Nghe truyện audio với player toàn cục (giữ trạng thái khi chuyển trang)
- Điều khiển phát: play/pause, tua, tốc độ, âm lượng
- Tiếp tục nghe từ vị trí đã dừng (lưu tiến trình cá nhân)
- Đánh dấu mốc nghe (bookmark) và ghi chú
- Theo dõi bộ truyện yêu thích
- Đánh giá và nhận xét truyện
- Gói VIP: mở khóa nội dung premium
- Gợi ý cá nhân hóa (theo sở thích và lịch sử nghe)
- PWA: cài đặt như ứng dụng trên điện thoại
- Chế độ nền tối/sáng và nhiều theme

### Quản trị
- Dashboard tổng quan hệ thống (user, series, episode, audit)
- Quản lý truyện (CRUD, phân loại theo thể loại, trạng thái)
- Quản lý tập (upload audio chunked, đánh dấu premium)
- Quản lý người dùng (phân quyền ADMIN/USER, gói VIP)
- Quản lý thể loại
- Phân tích (KPI, top truyện/tập, xu hướng theo ngày, xuất CSV)
- Audit log toàn bộ thao tác quản trị
- Upload ảnh bìa cho truyện

### Player
- Audio element toàn cục (global singleton)
- Queue phát liên tục (continuous play) giữa các tập
- Hẹn giờ ngủ (sleep timer: theo phút hoặc cuối tập)
- Tự động phát tập kế tiếp trong queue
- Analytics: play_start, pause, seek, complete, autoplay
- Phát hiện chặn autoplay (browser policy)

## Kiến trúc

```
tieuthuyetaudio/
├── app/
│   ├── api/            # API routes (REST)
│   │   ├── admin/      # Quản trị (CRUD, upload, analytics, audit)
│   │   ├── auth/       # NextAuth handler
│   │   ├── bookmarks/  # Mốc nghe
│   │   ├── follow/     # Theo dõi
│   │   ├── progress/   # Tiến trình nghe
│   │   ├── register/   # Đăng ký
│   │   ├── reviews/    # Đánh giá
│   │   ├── analytics/  # KPI + vitals
│   │   └── health/     # Health check
│   ├── admin/          # Trang quản trị
│   ├── truyen/         # Kho truyện + chi tiết truyện
│   ├── the-loai/       # Theo thể loại
│   ├── tim-kiem/       # Tìm kiếm
│   ├── tai-khoan/      # Trang cá nhân
│   ├── dang-nhap/      # Đăng nhập
│   ├── dang-ky/        # Đăng ký
│   └── vip/            # Gói VIP
├── components/
│   ├── admin/          # Components quản trị
│   ├── auth/           # Login form
│   ├── layout/         # AppFrame, Header, Footer, MobileNav
│   ├── player/         # PlayerProvider toàn cục
│   ├── series/         # StoryCard, StoryShelf, SeriesFilters
│   ├── ui/             # Button, Card, Input, Badge, Tabs, ...
│   └── vip/            # Upsell, PlanComparison
├── hooks/              # Custom React hooks (useChunkedUpload)
├── lib/                # Business logic, queries, helpers
│   ├── admin/          # Audit, dashboard, validators
│   ├── analytics/      # Events, KPI
│   ├── series/         # Queries, recommendations, validators
│   ├── upload/         # Chunked upload core
│   ├── theme/          # Theme definitions + context
│   └── auth.ts         # NextAuth config + helpers
├── stores/             # Zustand stores (player)
├── prisma/             # Schema + seed
└── public/uploads/     # Audio + cover files
```

## Bắt đầu

### Yêu cầu
- Node.js 20+
- PostgreSQL 15+

### Cài đặt

```bash
# Clone dự án
git clone <url>
cd tieuthuyetaudio

# Cài dependencies
npm install

# Tạo database
createdb tieuthuyetaudio

# Cấu hình môi trường
cp .env.example .env
# Sửa .env: điền DATABASE_URL, tạo AUTH_SECRET mới

# Push schema + seed data
npm run db:push
npm run db:seed

# Chạy dev
npm run dev
```

### Scripts hữu ích

| Script | Mô tả |
|--------|-------|
| `npm run dev` | Dev server (http://localhost:3000) |
| `npm run build` | Build production |
| `npm run typecheck` | Kiểm tra TypeScript |
| `npm run lint` | ESLint |
| `npm test` | Chạy unit test |
| `npm run test:e2e` | Chạy Playwright E2E |
| `npm run db:push` | Push schema lên database |
| `npm run db:seed` | Seed dữ liệu mẫu |

### Biến môi trường

| Biến | Bắt buộc | Mô tả |
|------|----------|-------|
| `DATABASE_URL` | Có | PostgreSQL connection string |
| `AUTH_SECRET` | Có | Secret cho JWT (tạo bằng `openssl rand -hex 32`) |
| `NEXTAUTH_URL` | Có | URL ứng dụng (VD: `http://localhost:3000`) |
| `NEXT_PUBLIC_FEATURE_RECOMMENDATION` | Không | Bật gợi ý cá nhân (`true`/`false`) |
| `NEXT_PUBLIC_FEATURE_PAYWALL` | Không | Bật paywall premium (`true`/`false`) |

## API endpoints

### Public
- `GET /api/health` — Health check database
- `POST /api/register` — Đăng ký tài khoản
- `POST /api/auth/*` — NextAuth (login, session, callback)
- `GET /api/theme` — Lấy theme preference
- `PUT /api/theme` — Cập nhật theme preference

### Có auth (user)
- `GET/POST/DELETE/PUT /api/bookmarks` — Mốc nghe
- `POST/DELETE /api/follow` — Theo dõi truyện
- `POST /api/progress` — Cập nhật tiến trình nghe
- `POST /api/reviews` — Đánh giá + xếp hạng

### Admin (yêu cầu ADMIN role)
- `GET/POST /api/admin/series` — Danh sách/tạo truyện
- `PATCH/DELETE /api/admin/series/[id]` — Sửa/xóa truyện
- `POST/DELETE /api/admin/series/bulk` — Xóa hàng loạt
- `POST/PATCH/DELETE /api/admin/episodes/...` — Quản lý tập
- `POST /api/admin/audio-upload/init` — Bắt đầu upload chunked
- `POST /api/admin/audio-upload/chunk` — Upload từng chunk
- `GET /api/admin/audio-upload/status` — Kiểm tra tiến trình
- `POST /api/admin/audio-upload/cancel` — Hủy upload
- `POST /api/admin/cover-upload` — Upload ảnh bìa
- `GET/POST/PATCH/DELETE /api/admin/categories` — Quản lý thể loại
- `GET/PATCH /api/admin/users/[id]/vip` — Quản lý VIP
- `GET/PATCH /api/admin/users/[id]/role` — Quản lý role
- `POST /api/admin/users/bulk` — Thao tác hàng loạt user
- `GET /api/admin/analytics/*` — Dashboard + xuất CSV

## Upload audio

Hệ thống upload sử dụng chunked upload, hỗ trợ file đến 500MB:

1. Client gọi `POST /api/admin/audio-upload/init` với thông tin file
2. Server trả về `uploadId` và số chunk cần upload
3. Client gửi từng chunk (5MB) qua `POST /api/admin/audio-upload/chunk`
4. Khi đủ chunk, server tự động ghép file hoàn chỉnh
5. Client nhận URL file hoàn chỉnh để lưu vào episode

Tính năng: hủy giữa chừng, kiểm tra tiến trình, tự động cleanup upload cũ sau 1 giờ.

## Feature flags

Các tính năng có thể bật/tắt qua biến môi trường (sử dụng prefix `NEXT_PUBLIC_FEATURE_`):

| Flag | Mặc định | Mô tả |
|------|----------|-------|
| `CONTINUOUS_PLAY` | `true` | Tự động phát tập tiếp theo |
| `SLEEP_TIMER` | `true` | Hẹn giờ ngủ |
| `RECOMMENDATION` | `false` | Gợi ý cá nhân hóa |
| `BOOKMARKS` | `true` | Đánh dấu mốc nghe |
| `PAYWALL` | `false` | Chặn nội dung premium cho user thường |

## Bảo mật

- CSRF protection qua origin/referer check trên API state-changing
- Rate limiting ở tầng middleware (có thể mở rộng)
- Admin routes được bảo vệ bằng middleware + server-side check
- Input validated bằng Zod (cả client lẫn server)
- Audit log cho mọi thao tác quản trị
- Session JWT, không lưu session trong database
