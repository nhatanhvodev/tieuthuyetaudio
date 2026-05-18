# Competitive Research va Chien luoc Nang cap Tieu Thuyet Audio

Date: 2026-05-17  
Project: `tieuthuyetaudio`

## 1. Muc tieu

Xay dung ke hoach nang cap tinh nang va UI/UX theo huong:

- Tang ty le nguoi dung quay lai sau lan nghe dau.
- Tang so phut nghe moi phien.
- Chuyen doi tu free sang VIP ro rang hon.
- Giup mobile web/PWA co trai nghiem "gan native app" hon.

## 2. Nhom doi thu da benchmark

### Nhom truyen audio Viet Nam (web-first)

- Tiem Tra Truyen: dinh vi free + VIP, nhan manh PWA, lich su nghe va dong bo.
- TruyenFullAudio: bo loc rat day, bang xep hang/trending, gamification va coin economy.
- Truyen.fit / Truyenaudio / MeTruyenAudio: tap trung catalog lon, cap nhat nhanh, category density cao.

### Nhom audiobook premium (app/product maturity)

- Fonos: thanh vien + the sach, mo hinh "so huu vinh vien" cho noi dung mo khoa, he sinh thai noi dung da dang.
- Voiz FM: subscription + mua le, kho noi dung lon, nang cap VIP ro o app listing.
- Audible: da tang goi thanh vien (Standard/Premium), credits, plus catalog, clip/note/bookmark, continuous play.
- Storytel: Search in Book, Voice Switcher, Dolby immersive audio, Kids Mode, offline mode, theo doi tac gia/series.
- Pocket FM: coin unlock cho episode premium, phu hop mo hinh chapter economy.

## 3. Danh gia nhanh hien trang codebase

Cac diem da co (tot):

- Trang chu, thu vien, chi tiet truyen, trang nghe tap, mini-player.
- Auth, theo doi truyen, danh gia, lich su nghe, admin co ban.
- PWA install CTA va luu progress nghe.

Cac diem con thieu so voi benchmark:

- Chua co queue/continuous play theo series.
- Chua co sleep timer, bookmark/note, chapter marker.
- Chua co recommendation ca nhan hoa theo hanh vi.
- VIP page con mo phong, value proposition chua du manh.
- Search/filter chua co faceted filter sau (theo narrator, do dai, mood, completion-progress).
- Chua co dashboard su kien nghe de toi uu retention (field analytics).
- Accessibility chua the hien ro checklist WCAG 2.2 tren cac thanh phan player/filter/nav.

## 4. Chien luoc nang cap (4 tru cot)

### Tru cot A: Listening Experience First

- Them `continuous play` giua cac tap trong cung series.
- Them `sleep timer` (10/20/30/45 phut + den het tap).
- Them `bookmark + note` theo moc thoi gian audio.
- Them `resume from last position` o home va story detail (1-click).

### Tru cot B: Discovery va Personalization

- "Nghe tiep", "Vi ban da nghe...", "Tac gia/chu de lien quan".
- Bo loc nang cao (trang thai, so tap, rating, mood/tags).
- Ranking trang chu theo 3 tang:
  - Trending 24h/7 ngay
  - Rising (toc do tang luot nghe)
  - Most completed (hoan thanh cao)

### Tru cot C: Monetization ro rang, minh bach

- VIP tiers don gian:
  - Free: co gioi han (quang cao nhe hoac khoa mot phan chap)
  - VIP: khong quang cao + noi dung mo rong + audio quality cao
- Co "hybrid ownership option" cho noi dung premium:
  - Thanh vien nghe trong ky
  - Mua le/doi the de "so huu vinh vien" (hoc tu Fonos/Audible credit model)
- Banner upsell canh cac diem co y dinh cao:
  - Sau 2-3 tap nghe lien tiep
  - Khi user luu bookmark/note lan dau

### Tru cot D: UX Reliability va Accessibility

- Tieu chuan Core Web Vitals:
  - LCP <= 2.5s tai p75
  - INP <= 200ms tai p75
  - CLS <= 0.1 tai p75
- Kiem tra WCAG 2.2 cho:
  - Focus visibility/focus not obscured
  - Target size cua control player tren mobile
  - Keyboard nav va SR labels cho controls

## 5. Roadmap de xuat 90 ngay

### Phase 1 (Ngay 1-30): Quick wins tang retention

- Continuous play theo series.
- Sleep timer.
- "Nghe tiep" shelf + CTA quay lai tap dang do.
- Refactor player UI cho 1-tay tren mobile.
- Event tracking can ban: play, pause, seek, complete, next-episode.

Expected outcome:

- Tang completion rate moi tap.
- Giam roi bo phien nghe sau 5 phut dau.

### Phase 2 (Ngay 31-60): Discovery + Monetization

- Faceted filters nang cao.
- Recommendation logic v1 dua tren category + completion + follow.
- VIP page moi: ro quyen loi, so sanh free/vip, CTA theo ngu canh.
- Trial paywall nhe cho 1 nhom noi dung premium.

Expected outcome:

- Tang conversion free -> VIP.
- Tang session length va stories per user.

### Phase 3 (Ngay 61-90): Differentiation

- Bookmark + note timeline.
- Narrator/voice metadata va browse theo narrator.
- Dashboard retention cohort (D1/D7/D30) + content-level analytics.
- Accessibility pass WCAG 2.2 cho player, nav, forms.

Expected outcome:

- Tang loyalty user core.
- Tao nen tang du lieu cho toi uu recommendation va pricing.

## 6. KPI can theo doi

- Activation: `% user phat audio trong 24h dau`.
- Retention: `D1`, `D7`, `D30`.
- Engagement:
  - `Listening minutes / DAU`
  - `% episode completion`
  - `% sessions co next-episode auto-play`
- Monetization:
  - `Free -> VIP conversion`
  - `ARPPU`
  - `% user nhan upsell -> click -> mua`
- UX quality:
  - `LCP/INP/CLS p75`
  - `% playback errors`
  - `% search zero-result`

## 7. Uu tien thuc thi cho du an nay (goi y sat hien trang)

1. Lam ngay: continuous play + sleep timer + nghe tiep shelf.  
2. Ke tiep: recommendation v1 + VIP proposition moi.  
3. Sau do: bookmark/note + analytics cohort + accessibility hardening.

Neu chi chon 1 thu de lam truoc, nen chon **continuous play** vi de trien khai tren architecture hien tai (player-store + provider) va tac dong truc tiep den listening minutes va retention.

