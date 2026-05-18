# Kế hoạch triển khai nâng cấp UI theo web tham chiếu

## Bước 1: Nền dữ liệu và truy vấn

- [x] Kiểm tra schema hiện tại có đủ `coverUrl`, `listenCount`, `durationSeconds`, `episodeCount`.
- [x] Cập nhật seed ảnh bìa và nội dung demo nếu cần.
- [x] Bổ sung query tập mới cập nhật cho trang chủ.

## Bước 2: Thành phần giao diện dùng lại

- [x] Nâng cấp `StoryCard` để dùng ảnh bìa, badge trạng thái, rating, lượt nghe và CTA.
- [x] Nâng cấp `StoryShelf` theo shelf ngang mobile/lưới desktop.
- [x] Nâng cấp `EpisodeList` theo row có thumbnail, thời lượng, lượt nghe và nút play icon.
- [x] Thêm tab chi tiết truyện nếu cần client state.

## Bước 3: Trang public

- [x] Trang chủ: hero ảnh, chip thể loại, xu hướng, tập mới cập nhật, CTA cài app.
- [x] Trang thư viện: header, filter toolbar, sort, grid responsive.
- [x] Trang chi tiết: cover, metadata, actions, tabs tập/đánh giá/thảo luận.
- [x] Trang nghe tập: player nổi bật, bối cảnh truyện, danh sách tập khác.
- [x] Trang cộng đồng: hướng dẫn cài PWA, composer, bài ghim, feed.

## Bước 4: Shell responsive/PWA

- [x] Header/mobile nav rõ icon và không che nội dung.
- [x] Footer đồng bộ visual mới.
- [x] Nút cài app hiển thị bằng tiếng Việt, hoạt động với manifest hiện tại.

## Bước 5: Kiểm chứng

- [x] Seed database nếu thay đổi dữ liệu.
- [x] Chạy lint/typecheck/unit/e2e/build.
- [x] Kiểm tra browser desktop/mobile các trang chính.
- [x] Sửa bug phát hiện trong quá trình verify.
