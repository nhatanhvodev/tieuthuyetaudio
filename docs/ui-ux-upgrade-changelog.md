# UI/UX Upgrade Changelog

Ngày cập nhật: 2026-05-19
Phạm vi: Toàn bộ giao diện user-facing + admin-facing
Dự án: `D:/tieuthuyetaudio`

## 1) Mục tiêu đợt nâng cấp

- Hiện đại hóa giao diện theo visual language thống nhất: glass/blur/gradient.
- Chuẩn hóa tiếng Việt có dấu trên toàn bộ text user-facing/admin-facing (bao gồm aria/label/placeholder).
- Giữ nguyên logic hiện có, không refactor kiến trúc lớn.
- Đảm bảo tương thích mobile/PWA.
- Đảm bảo pipeline chất lượng pass sau thay đổi.

## 2) Thay đổi nền tảng thiết kế (Design System nhẹ)

### `app/globals.css`
- Nâng chất lượng nền tổng thể (radial highlight).
- Chuẩn hóa font stack.
- Bổ sung utility tái sử dụng:
  - `.glass-panel`: panel kính mờ đồng nhất giữa các trang.
  - `.subtle-grid`: lớp nền grid nhẹ cho section chính.

Tác động:
- Giảm sự rời rạc visual giữa page/component.
- Tăng tính nhất quán khi mở rộng UI về sau.

## 3) Trang người dùng (App Router pages)

### Trang chủ
- `app/page.tsx`
  - Polish hero/shelf/CTA theo ngôn ngữ thiết kế mới.
  - Chuẩn hóa text tiếng Việt có dấu.
  - Cập nhật fallback alt text có dấu.
  - Áp dụng panel kính cho block quan trọng.

### Thư viện truyện
- `app/truyen/page.tsx`
  - Chuẩn hóa copy tiếng Việt có dấu cho tiêu đề/nhãn/filter/empty state.
  - Đồng bộ phong cách panel (glass) và spacing.

### VIP
- `app/vip/page.tsx`
  - Việt hóa copy premium/CTA/FAQ.
  - Đồng bộ khối nội dung với glass-panel.

### Thể loại
- `app/the-loai/page.tsx`
  - Card thể loại nâng cấp visual đồng nhất.
- `app/the-loai/[slug]/page.tsx`
  - Header/panel được đồng bộ style, cải thiện nhịp spacing.

### Tìm kiếm
- `app/tim-kiem/page.tsx`
  - Bọc vùng tìm kiếm bằng glass-panel.
  - Polish trạng thái rỗng.

### Tài khoản
- `app/tai-khoan/page.tsx`
  - Chuẩn hóa toàn bộ nhãn tiếng Việt có dấu.

### Chi tiết truyện + nghe tập
- `app/truyen/[slug]/page.tsx`
  - Việt hóa breadcrumb/stat label.
  - Panel “Nghe tiếp”/thống kê theo glass style.
- `app/truyen/[slug]/tap/[episodeNumber]/page.tsx`
  - Chuẩn hóa copy paywall/upsell.
  - Đồng bộ panel player/sidebar.

### Đăng nhập
- `app/dang-nhap/page.tsx`
  - Fallback Suspense dùng panel kính thống nhất.

### Cộng đồng
- `app/cong-dong/page.tsx`
  - Viết lại nội dung page với tiếng Việt có dấu đầy đủ.
  - Đồng bộ card/panel theo visual language mới.

## 4) Layout & điều hướng toàn cục

### Header / Footer / Mobile Nav
- `components/layout/site-header.tsx`
  - Tăng chất lượng blur/background.
  - Logo accent gradient.
  - Tinh chỉnh nav transition và tương phản ô search.
- `components/layout/mobile-nav.tsx`
  - Chuẩn hóa label + aria có dấu.
  - Nền blur thống nhất với header.
- `components/layout/site-footer.tsx`
  - Polish nền blur + brand gradient.

## 5) Components nghiệp vụ chính

### Story/Series
- `components/series/story-card.tsx`
  - Nâng card elevation/shadow/hover.
  - Accent hover cho title.
- `components/series/series-filters.tsx`
  - Việt hóa label/options/placeholder/aria.
- `components/series/series-detail-tabs.tsx`
  - Chuẩn hóa tab labels/comments/review copy.
  - Đồng bộ panel style.

### Search
- `components/search/search-box.tsx`
  - Chuẩn hóa label/aria/placeholder/button text.

### VIP
- `components/vip/contextual-upsell.tsx`
  - Việt hóa title/description/CTA/badge.
- `components/vip/plan-comparison.tsx`
  - Việt hóa toàn bộ bảng tính năng.
  - Đồng bộ container glass-panel.

### Review
- `components/review/review-form.tsx`
  - Chuẩn hóa thông điệp trạng thái/form copy.
  - Đồng bộ panel style.

### Player
- `components/player/player-provider.tsx`
  - Việt hóa thông báo lỗi.
- `components/player/audio-player.tsx`
  - Chuẩn hóa hàng loạt text runtime (bookmark/sleep timer/login prompt/status) sang tiếng Việt có dấu.

## 6) Admin UI/UX

### Điều hướng admin
- `components/admin/admin-nav.tsx`
  - Việt hóa labels: Tổng quan/Truyện/Tập/Người dùng.

### Form tập
- `components/admin/episode-form.tsx`
  - Việt hóa label và trạng thái submit/error.
  - Ví dụ: Truyện, Số tập, Tên tập, Thời lượng giây, Đánh dấu tập premium.

### Dashboard admin
- `app/admin/page.tsx`
  - Bổ sung mô tả dashboard.
  - Đồng bộ CTA dạng Button.

### Quản lý tập
- `app/admin/tap/page.tsx`
  - Việt hóa heading/cột/trạng thái hiển thị.

### Analytics admin
- `app/admin/analytics/page.tsx`
  - Việt hóa nhãn KPI và chú thích retention.

## 7) Accessibility & nội dung tiếng Việt

Đã rà soát và chuẩn hóa:
- `aria-label` quan trọng ở khu vực điều hướng/tìm kiếm/filter.
- Label/placeholder/button text ở form và control chính.
- Nội dung text không dấu trên các màn user/admin đã được thay bằng tiếng Việt có dấu.

Kết quả rà soát tự động cuối:
- Không còn match theo các pattern không dấu mục tiêu trong phạm vi `app/` và phần lớn `components/` liên quan trực tiếp UI đã chỉnh.

## 8) Kiểm thử và xác nhận chất lượng

Chạy lại nhiều vòng sau mỗi cụm thay đổi lớn.
Kết quả cuối cùng:

- `npm run lint` -> PASS
- `npm run typecheck` -> PASS
- `npm run build` -> PASS

Build Next.js hoàn tất, generate static pages thành công.

## 9) Files đã thay đổi (tổng hợp)

### App pages
- `app/globals.css`
- `app/page.tsx`
- `app/truyen/page.tsx`
- `app/vip/page.tsx`
- `app/the-loai/page.tsx`
- `app/the-loai/[slug]/page.tsx`
- `app/tim-kiem/page.tsx`
- `app/tai-khoan/page.tsx`
- `app/dang-nhap/page.tsx`
- `app/truyen/[slug]/page.tsx`
- `app/truyen/[slug]/tap/[episodeNumber]/page.tsx`
- `app/cong-dong/page.tsx`
- `app/admin/page.tsx`
- `app/admin/tap/page.tsx`
- `app/admin/analytics/page.tsx`

### Components
- `components/layout/site-header.tsx`
- `components/layout/mobile-nav.tsx`
- `components/layout/site-footer.tsx`
- `components/series/story-card.tsx`
- `components/series/series-filters.tsx`
- `components/series/series-detail-tabs.tsx`
- `components/search/search-box.tsx`
- `components/vip/contextual-upsell.tsx`
- `components/vip/plan-comparison.tsx`
- `components/review/review-form.tsx`
- `components/player/player-provider.tsx`
- `components/player/audio-player.tsx`
- `components/admin/admin-nav.tsx`
- `components/admin/episode-form.tsx`

## 10) Known warnings (không chặn build)

- Prisma cảnh báo deprecate `package.json#prisma` (khuyến nghị migrate sang `prisma.config.ts` trước Prisma 7).
- Đây là cảnh báo nền tảng, chưa nằm trong phạm vi UI/UX và không ảnh hưởng build pass hiện tại.

## 11) Checklist QA nhanh cho team

### User-facing
- [ ] Trang chủ: hero/shelf/CTA hiển thị đúng trên desktop + mobile.
- [ ] Trang truyện/thể loại/tìm kiếm/tài khoản: text tiếng Việt có dấu đầy đủ.
- [ ] Trang chi tiết truyện + trang nghe tập: panel/cta/paywall hiển thị đúng.
- [ ] Header/footer/mobile-nav: tương phản và thao tác tốt trên dark theme.

### Admin-facing
- [ ] Dashboard/tập/analytics: labels tiếng Việt có dấu và không vỡ layout.
- [ ] Form tập: label, validation, submit state hiển thị đúng.

### Cross-cutting
- [ ] Focus states/keyboard navigation cơ bản hoạt động.
- [ ] Không có lỗi console nghiêm trọng khi thao tác luồng chính.
- [ ] Re-run CI local: lint/typecheck/build đều pass.

---

Tài liệu này là snapshot bàn giao của đợt nâng cấp UI/UX hiện tại.
Nếu có vòng polish tiếp theo, append thêm section mới theo mốc thời gian để giữ lịch sử thay đổi rõ ràng.
