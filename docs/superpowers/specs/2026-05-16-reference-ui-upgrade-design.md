# Đặc tả nâng cấp UI theo truyenaudio25.com

## Mục tiêu

Nâng cấp Tiểu thuyết Audio thành website audio novel responsive, mobile-friendly, có tùy chọn cài PWA/WebAPK cho người dùng mobile. Giao diện lấy cảm hứng cấu trúc từ `https://truyenaudio25.com/` nhưng không sao chép nội dung, hình ảnh hay nhận diện.

## Nguồn tham chiếu đã duyệt

- Visual chính: nền tối điện ảnh, ảnh bìa lớn, overlay ấm, điểm nhấn vàng/cam.
- Trang chủ: hero có CTA, thanh tìm kiếm, chip thể loại, khu xu hướng, danh sách tập mới cập nhật.
- Thư viện truyện: header lớn, tìm kiếm/lọc/sắp xếp, lưới bìa, badge trạng thái, lượt nghe, số tập.
- Chi tiết truyện: breadcrumb, ảnh bìa, badge, thống kê, nút nghe thử/theo dõi/chia sẻ, tab tập/đánh giá/thảo luận.
- Trang cộng đồng: khối hướng dẫn cài app, composer góp ý, chip chủ đề, bài ghim và feed thảo luận.
- Mobile: ưu tiên thao tác một tay, nội dung không tràn, nav rõ bằng icon, player không che nội dung quan trọng.

## Phạm vi triển khai

- `app/page.tsx`: dựng lại trang chủ theo hero ảnh + shelf + danh sách tập mới.
- `app/truyen/page.tsx`: nâng cấp trang thư viện với toolbar, chip nhanh, thống kê kết quả và lưới card ảnh.
- `app/truyen/[slug]/page.tsx`: dựng trang chi tiết theo layout tham chiếu, thêm tab nội dung.
- `app/truyen/[slug]/tap/[episodeNumber]/page.tsx`: làm trang nghe tập có bìa, player nổi bật, danh sách tập liên quan.
- `app/cong-dong/page.tsx`: thêm feed cộng đồng và box hướng dẫn cài ứng dụng.
- Header/footer/mobile nav/PWA button: làm đồng bộ với visual mới.
- Seed dữ liệu: bổ sung ảnh bìa public và nội dung tiếng Việt có dấu.
- Test: cập nhật e2e theo UI mới, giữ kiểm tra player chỉ có một thanh tua và thời gian dạng giờ/phút/giây.

## Ngoài phạm vi cho lượt này

- Không xây hệ thống upload audio thật.
- Không xây realtime comment/community backend.
- Không thay đổi model database nếu dữ liệu hiện có đã đủ cho UI.
- Không thay đổi admin trừ khi phát hiện bug chặn build/test.

## Tiêu chí hoàn tất

- Toàn bộ text UI public là tiếng Việt có dấu.
- Card/shelf/player có hình ảnh hoặc artwork thật, không còn hero minh họa chỉ bằng khối màu.
- Desktop và mobile đều đọc được, không chồng lấn text, không cần cuộn ngang ngoài shelf chủ động.
- PWA install option vẫn xuất hiện trên mobile/desktop hỗ trợ.
- `npm run lint`, `npm run typecheck`, `npm run test`, `npm run test:e2e`, `npm run build` chạy qua.
