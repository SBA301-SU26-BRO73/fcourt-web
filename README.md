# fcourt-web

Web frontend của FCOURT (hệ thống đặt sân thể thao): React 19 + TypeScript + Vite, Tailwind CSS v4, React Router, TanStack Query, Axios. Path alias `@/` trỏ vào `src`.

## Nguồn gốc

Repo này được tách từ thư mục `frontend/` của monorepo cũ `fudn-traltb-su26/group-project-sba301_fcourt` bằng `git subtree split`, nên giữ nguyên lịch sử commit của frontend. Bản cũ chạy trên backend monolith Spring Boot; backend mới là các microservice trong repo `fcourt-backend`. Phần web chưa được chuyển sang gọi API mới, danh sách khác biệt nằm ở [docs/api-gap-report.md](docs/api-gap-report.md).

## Chạy local

Yêu cầu Node.js 20+.

```bash
cp .env.example .env     # chỉnh VITE_API_URL nếu cần
npm ci
npm run dev              # http://localhost:5173
```

Các lệnh khác:

```bash
npm run build            # tsc -b && vite build, output ở dist/
npm test                 # vitest run
npm run lint
```

## Biến môi trường

| Biến | Ý nghĩa |
|---|---|
| `VITE_API_URL` | Base URL của API, mặc định `/api` (cùng origin). `npm run dev` proxy từng prefix `/api/...` sang đúng service qua `vite.config.ts`; image production dùng nginx proxy `/api` và `/ws-fcourt` sang `API_UPSTREAM`. |
| `VITE_GOOGLE_CLIENT_ID` | OAuth Web client ID cho đăng nhập Google (khách hàng). Nếu trống thì nút Google bị ẩn. Phải trùng client mà auth-service kiểm tra (`AUTH_GOOGLE_CLIENT_ID`); thêm origin của web (ví dụ `http://localhost:5173`) vào "Authorized JavaScript origins" trong Google Cloud Console. Web gửi `credential` của Google Identity Services lên `POST /api/auth/google` dưới dạng `{ idToken }`. |
| `DEV_BACKEND_HOST` | Chỉ dùng khi dev: host chạy các service (mặc định `localhost`). |
| `API_UPSTREAM` | Chỉ dùng khi chạy container: origin của gateway/ALB, mặc định `http://gateway:8080`. |

Link quên mật khẩu trong email trỏ tới route `/reset-password?token=...` của web: đặt `NOTIFICATION_RESET_PASSWORD_URL` của notification-service thành `<origin web>/reset-password`.

`.env` và `.env.local` không được commit; chỉ `.env.example` nằm trong git.

## Cấu trúc thư mục

```text
src
|- app           # router, providers, query client
|- common        # config, constants (api-endpoints.ts), helpers
|- components    # UI dùng lại
|- context       # React context (staff session, ...)
|- hooks         # custom hooks bọc query/state
|- layouts       # layout cấp trang
|- pages         # page theo route
|- services      # axios client (services/http) và các module gọi API
|- types         # shared types
|- utils         # helper, token storage
```

Quy ước: endpoint khai báo trong `src/common/constants/api-endpoints.ts` hoặc trong từng file `services/*`, không hard-code ở page.

## Git

Nhánh `main` (ổn định) và `dev` (tích hợp). Commit theo dạng `type(scope): message`.
