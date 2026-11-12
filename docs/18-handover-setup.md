# 18 - Bàn giao: setup project mới từ đầu

Repo: `hoangtientimmy/zvas-ai-tool`. Mọi cấu hình của chủ cũ (Firebase project, GA4, Sentry, Cloud Run, domain) **đã gỡ khỏi code**.
Chủ mới tạo tài nguyên của mình rồi điền giá trị theo checklist dưới. Không có dữ liệu cũ đi kèm: user, lịch sử ảnh, analytics bắt đầu trống.

Trong docs các chỗ `<PROJECT_ID>`, `<PROJECT_NUMBER>`, `<GA4_MEASUREMENT_ID>` là placeholder — thay bằng giá trị của bạn.

## Checklist nhanh

| # | Việc | Kết quả cần có |
| --- | --- | --- |
| 1 | Tạo Firebase project | `PROJECT_ID`, `PROJECT_NUMBER` |
| 2 | Bật Authentication → Email/Password | |
| 3 | Tạo Firestore database | `firestoreDatabaseId` (khuyên dùng `(default)`) |
| 4 | Đăng ký Web App | Nội dung `firebase-applet-config.json` |
| 5 | Tạo service account key | File JSON service account |
| 6 | Deploy Firestore rules + indexes | |
| 7 | Lấy API key provider AI | `GEMINI_API_KEY` (+ OpenAI/Seedance/Seedream nếu dùng) |
| 8 | Điền biến môi trường (local + Vercel) | |
| 9 | Tạo tài khoản admin đầu tiên | Đăng nhập được, vào được trang Admin |
| 10 | (Tuỳ chọn) GA4, Sentry, domain riêng | |

## 1–4. Firebase

1. [Firebase Console](https://console.firebase.google.com) → **Add project**. Ghi lại **Project ID** và **Project number** (Project settings → General).
2. **Authentication** → Get started → Sign-in method → bật **Email/Password**.
   App đăng nhập bằng username; Firebase lưu dạng email giả `{username}@zvas.local` (`utils/authCredentials.ts`).
3. **Firestore Database** → Create database → chọn **Production mode**, region gần người dùng (ví dụ `asia-southeast1`).
   Dùng database `(default)` là đơn giản nhất. Nếu tạo named database thì sửa `"database"` trong `firebase.json` cho khớp.
4. Project settings → General → **Your apps** → Add app → **Web**. Copy object `firebaseConfig`, tạo file `firebase-applet-config.json` ở thư mục gốc theo mẫu `firebase-applet-config.example.json`:

   ```json
   {
     "projectId": "<PROJECT_ID>",
     "appId": "1:<PROJECT_NUMBER>:web:...",
     "apiKey": "AIza...",
     "authDomain": "<PROJECT_ID>.firebaseapp.com",
     "firestoreDatabaseId": "(default)",
     "storageBucket": "<PROJECT_ID>.firebasestorage.app",
     "messagingSenderId": "<PROJECT_NUMBER>",
     "measurementId": ""
   }
   ```

   `firestoreDatabaseId` không có trong config Firebase đưa ra — tự thêm (`(default)` hoặc id named database).
   File này đã gitignore. Trên Vercel/CI dùng biến `FIREBASE_APPLET_CONFIG` (nội dung file).

## 5. Service account (cho server)

Project settings → **Service accounts** → **Generate new private key** → tải file JSON.

- Local: lưu thành `service-account.json` ở thư mục gốc (đã gitignore), hoặc trỏ `GOOGLE_APPLICATION_CREDENTIALS`.
- Vercel: dán **nội dung** file vào biến `FIREBASE_SERVICE_ACCOUNT` (JSON thô hoặc base64).

Key này có toàn quyền Firestore/Auth — không commit, không gửi qua chat.

## 6. Firestore rules + indexes

```bash
npm i -g firebase-tools
firebase login
firebase use --add            # chọn project mới, alias "default" → ghi vào .firebaserc
firebase deploy --only firestore:rules,firestore:indexes
```

Thiếu bước này app báo lỗi permission / thiếu index khi đọc lịch sử, phiên đăng nhập.

## 7. API key provider AI

| Provider | Biến | Lấy ở |
| --- | --- | --- |
| Gemini (mặc định) | `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/apikey) |
| OpenAI | `OPENAI_API_KEY` | platform.openai.com |
| Seedance | `SEEDANCE_API_KEY` | |
| Seedream (BytePlus) | `SEEDREAM_API_KEY` | console.byteplus.com |

Chỉ cần key của provider sẽ bật. Key chỉ nằm ở server, không bao giờ dùng tiền tố `VITE_`.

## 8. Biến môi trường

### Local (`.env.local`, đã gitignore)

```bash
GEMINI_API_KEY=...
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json
# tuỳ chọn
# VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
# SENTRY_DSN=
# VITE_SENTRY_DSN=
```

Cùng với `firebase-applet-config.json` ở bước 4. Chạy: `npm install && npm run dev` → http://localhost:3000.

### Vercel (Project → Settings → Environment Variables)

| Biến | Bắt buộc | Dùng lúc | Ghi chú |
| --- | --- | --- | --- |
| `FIREBASE_APPLET_CONFIG` | ✔ | build + runtime | Nội dung `firebase-applet-config.json` |
| `FIREBASE_SERVICE_ACCOUNT` | ✔ | runtime | Nội dung JSON service account |
| `GEMINI_API_KEY` | ✔ (nếu dùng Gemini) | runtime | |
| `OPENAI_API_KEY`, `SEEDANCE_API_KEY`, `SEEDREAM_API_KEY` | theo provider | runtime | |
| `ALLOWED_ORIGINS` | nên có | runtime | `https://<domain>` — nhiều domain cách bằng dấu phẩy |
| `VITE_SITE_URL` | nên có | build | `https://<domain>` — sinh canonical / og:url / og:image cho chia sẻ link |
| `VITE_GA_MEASUREMENT_ID` | tuỳ chọn | build | `G-XXXXXXXXXX`; thiếu thì không nạp GA |
| `SENTRY_DSN`, `VITE_SENTRY_DSN` | tuỳ chọn | runtime / build | docs/12 |
| `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` | tuỳ chọn | build | Upload source maps |

Biến `VITE_*` được nhúng lúc **build** → đổi xong phải **Redeploy**. Chi tiết Vercel: `docs/17-vercel-deployment.md`.

Sau deploy: Firebase Console → Authentication → Settings → **Authorized domains** → thêm domain Vercel (`<project>.vercel.app` và domain riêng nếu có).

## 9. Tài khoản admin đầu tiên

Admin UI tạo được user, nhưng phải có admin đầu tiên trước:

1. Firebase Console → Authentication → **Add user**: email `admin@zvas.local`, mật khẩu ≥ 12 ký tự. Copy **User UID**.
2. Gắn hồ sơ admin trong Firestore (cần service account ở bước 5):

   ```bash
   npm run provision-user -- --uid <USER_UID> --username admin --role admin --status approved
   ```

3. Đăng nhập app bằng username `admin`. Vào **Admin → Settings** chọn provider/model đang dùng (document `settings/global` được tạo lần lưu đầu), rồi tạo thêm user ở **Admin → Users**.

Chi tiết role/trạng thái: `docs/05-security-roles.md`, `docs/08-auth-users-setup.md`.

## 10. Tuỳ chọn

- **GA4:** analytics.google.com → tạo property + Web stream → Measurement ID `G-…` → `VITE_GA_MEASUREMENT_ID`.
- **Sentry:** theo `docs/12-sentry-setup.md`.
- **Domain riêng:** Vercel → Domains. Cập nhật `ALLOWED_ORIGINS`, `VITE_SITE_URL`, Authorized domains của Firebase.
- **Cloud Run thay vì Vercel:** `docs/06-live-deployment.md` + `scripts/setup-github-deploy.sh` (`PROJECT_ID=<PROJECT_ID> bash scripts/setup-github-deploy.sh`). Không bắt buộc nếu chỉ dùng Vercel — khi đó có thể tắt job `deploy` trong `.github/workflows/deploy.yml` (job `check` vẫn hữu ích cho PR).

## Kiểm tra sau setup

- `https://<domain>/_health` → `{"status":"ok"}`
- Đăng nhập `admin` thành công, thấy tab Admin.
- Tạo thử 1 ảnh → có kết quả và xuất hiện trong lịch sử.
