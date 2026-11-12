# 17 - Deploy lên Vercel

Song song với Cloud Run (docs/06). Setup project mới từ đầu (Firebase, admin, biến môi trường): `docs/18-handover-setup.md`. Cùng một code; Vercel build bằng `npm run vercel-build`.

## Cách hoạt động

`scripts/build-vercel.ts` tạo `.vercel/output/` theo [Build Output API v3](https://vercel.com/docs/build-output-api/v3):

| Phần | Nguồn | Ghi chú |
| --- | --- | --- |
| `static/` | `vite build` → `dist/` | Serve qua CDN, kèm header bảo mật y hệt helmet production |
| `functions/api.func` | `server/vercelHandler.ts` → `server/app.ts` | Express API, bundle bằng esbuild, node_modules lấy bằng `@vercel/nft` |
| `config.json` | | `/api/*`, `/_health` → function; còn lại SPA fallback về `index.html` |

Không dùng thư mục `api/` zero-config vì server là ESM import không đuôi `.js` — `@vercel/node` transpile từng file sẽ lỗi `ERR_MODULE_NOT_FOUND`.

`server.ts` (dev local, Docker/Cloud Run) và Vercel dùng chung `createApp()` trong `server/app.ts`.

## Setup một lần

1. Vercel → **Add New Project** → import repo GitHub. Framework Preset để **Other**; các lệnh lấy từ `vercel.json`, không cần sửa.
2. **Settings → Environment Variables** (Production + Preview):

   | Biến | Bắt buộc | Giá trị |
   | --- | --- | --- |
   | `FIREBASE_APPLET_CONFIG` | ✔ | Nội dung `firebase-applet-config.json` |
   | `FIREBASE_SERVICE_ACCOUNT` | ✔ | JSON service account (thô hoặc base64) có quyền Firestore + Auth |
   | `GEMINI_API_KEY`, `OPENAI_API_KEY`, `SEEDANCE_API_KEY`, `SEEDREAM_API_KEY` | theo provider dùng | |
   | `ALLOWED_ORIGINS` | nên có | Domain Vercel, ví dụ `https://<project>.vercel.app` |
   | `VITE_SITE_URL` | nên có | Domain public, sinh canonical/og:url (build) |
   | `VITE_GA_MEASUREMENT_ID` | tuỳ chọn | GA4 `G-…` (build) |
   | `SENTRY_DSN`, `VITE_SENTRY_DSN` | tuỳ chọn | |
   | `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` | tuỳ chọn | Upload source maps lúc build |

   Trên Cloud Run, Firebase Admin dùng service account mặc định của GCP; Vercel không có nên **bắt buộc** `FIREBASE_SERVICE_ACCOUNT`, thiếu thì mọi truy cập Firestore lỗi.
3. Firebase Console → Authentication → Settings → **Authorized domains** → thêm domain Vercel (đăng nhập từ domain lạ sẽ bị chặn).
4. Deploy. Kiểm tra `https://<domain>/_health` trả `{"status":"ok"}`.

## Giới hạn khác Cloud Run

- **Body request tối đa 4.5MB** (Cloud Run: 10MB). Client chặn trước khi gửi (`MAX_REQUEST_IMAGE_BASE64_CHARS` trong `services/geminiService.ts`); ảnh đã nén về cạnh ≤2048px nên thường đủ cho 2–3 ảnh.
- **Thời gian chạy tối đa 300s** (`maxDuration` trong build script) — khớp budget Gemini 240s. Gói Hobby cần bật Fluid Compute (mặc định với project mới).
- Rate limit dùng Firestore (`NODE_ENV=production` mặc định) — đúng cho serverless nhiều instance.
- Sentry chỉ bắt lỗi qua `setupExpressErrorHandler`; auto-tracing http/express không chạy vì không có `--import` loader.

## Build thử local

```bash
npm run vercel-build
```

Kết quả ở `.vercel/output/` (đã gitignore).
