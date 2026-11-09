# Báo cáo khác biệt API: web cũ và backend microservice mới

Ngày lập: 2026-11-09. Phạm vi: so sánh mọi lời gọi HTTP của frontend này (`src/`) với backend microservice trong `fcourt-backend` (nhánh `dev`), có đối chiếu với monolith cũ và app Flutter (`fcourt-flutter`) đã chạy trên backend mới.

Quy ước đường dẫn nguồn:

* `web:` là repo này (`fcourt-web`).
* `be:` là `fcourt-backend`.
* `old-be:` là `group-project-sba301_fcourt/backend/backend/src/main/java/com/sba301/backend`.
* `flutter:` là `fcourt-flutter`.

Phương pháp: danh sách endpoint của backend mới được trích bằng cách quét annotation `@GetMapping/@PostMapping/...` và `@RequestMapping` của mọi `*Controller` trong từng service, không chạy hệ thống thật. Phần request/response chỉ đối chiếu các DTO chính; chỗ ghi "cần kiểm tra" nghĩa là chưa so từng field.

## 0. Tóm tắt

| Chỉ số | Giá trị |
|---|---|
| Lời gọi HTTP khác nhau của web cũ (method + path, mục 1) | 89 dòng |
| Giống hoàn toàn (path và method) | 18 (cả 18 vẫn đổi cấu trúc response, xem mục 4) |
| Đổi path hoặc method | 42 |
| Đổi contract (cùng path, khác body, response hoặc luồng) | 18 |
| Thiếu ở backend mới | 11 |
| Endpoint công khai của backend mới (không tính `/api/internal/**`, JWKS, webhook) | khoảng 153 |
| Endpoint nội bộ giữa các service (`/api/internal/**`), web không được gọi | 29 |
| Endpoint mới mà web cũ không dùng | khoảng 100 (mục 3) |
| Hạng mục việc frontend đề xuất | 15 (F0 đến F14, mục 3.3) |

Các số "khoảng" lấy từ script quét annotation nên có thể lệch vài endpoint (alias, route khai báo bằng cấu hình). Các số trạng thái ở trên là số dòng trong bảng mục 2.

Kết luận chính:

1. Web cũ không chạy được với backend mới nếu không sửa lớp nền (mục 4): response không còn bọc `{httpStatus,data,message}`, JWT đổi claim, `expiresIn` đổi từ mốc epoch (ms) sang số giây, lỗi đổi sang RFC 7807 (`detail`), và đặt chỗ phải giữ slot trước.
2. Luồng đặt sân của khách đổi lớn nhất (hold slot Redis TTL, `Idempotency-Key`, WebSocket thay đổi slot, upload biên lai theo từng booking). Đây là hạng mục L.
3. Một số tính năng web cũ có nhưng backend mới chưa có: danh sách mọi user cho super admin, tra cứu booking cho khách vãng lai, upload ảnh chung, sửa trạng thái booking thủ công, xem chi tiết và xóa sản phẩm, sửa và xem lẻ time slot template. Cần quyết định bỏ khỏi web hay yêu cầu team backend bổ sung (mục 3.2).

## 1. Lời gọi HTTP của web cũ

`baseURL` lấy từ `VITE_API_URL` (mặc định `/api`), xem `web:src/common/config/env.ts`. Mọi path dưới đây là path sau `/api`. Client axios và interceptor refresh token ở `web:src/services/http/axios-client.ts`; danh sách path ở `web:src/common/constants/api-endpoints.ts`.

Còn ba khai báo trong `api-endpoints.ts` nhưng không có lời gọi nào: `GET /bookings/revenue`, `GET /orders`, `GET /categories` (không tính vào 89).

Cột "Trang dùng" dựa trên import service trong `web:src/pages`, `web:src/hooks`, `web:src/components`; route ở `web:src/app/router.tsx`. Đường dẫn trong cột "File service" tính từ `web:src/services/`.

| # | Method | Path (sau /api) | File service | Trang hoặc hook dùng |
|---|---|---|---|---|
| 1 | POST | /auth/login | auth/auth.service.ts | pages/auth (login), hooks/use-auth.ts |
| 2 | POST | /auth/register/customer | auth/auth.service.ts | pages/auth (register customer) |
| 3 | POST | /auth/register/court-owner (multipart) | auth/auth.service.ts | pages/auth (register court owner) |
| 4 | POST | /auth/refresh | auth/auth.service.ts, http/axios-client.ts | interceptor |
| 5 | GET | /auth/profile | auth/auth.service.ts | pages/profile/profile-page.tsx |
| 6 | PATCH | /auth/profile | auth/auth.service.ts | profile-page.tsx |
| 7 | PATCH | /auth/password | auth/auth.service.ts | profile-page.tsx |
| 8 | GET | /users | user/user.service.ts | pages/super-admin (users, pending), hooks/use-users.ts |
| 9 | GET | /users/{id} | user/user.service.ts | hooks/use-users.ts |
| 10 | PATCH | /users/{id}/approve | user/user.service.ts | super-admin pending |
| 11 | PATCH | /users/{id}/reject | user/user.service.ts | super-admin pending |
| 12 | PATCH | /users/{id}/lock | user/user.service.ts | super-admin users |
| 13 | PATCH | /users/{id}/unlock | user/user.service.ts | super-admin users |
| 14 | GET | /court-types | court-type/court-type.service.ts | super-admin court types, hooks/use-court-types.ts |
| 15 | POST | /court-types | court-type/court-type.service.ts | như trên |
| 16 | PUT | /court-types/{id} | court-type/court-type.service.ts | như trên |
| 17 | DELETE | /court-types/{id} | court-type/court-type.service.ts | như trên |
| 18 | GET | /subscription-plans | subscription-plan/subscription-plan.service.ts | super-admin plans, hooks/use-subscription-plans.ts |
| 19 | POST | /subscription-plans | subscription-plan/subscription-plan.service.ts | như trên |
| 20 | PUT | /subscription-plans/{id} | subscription-plan/subscription-plan.service.ts | như trên |
| 21 | DELETE | /subscription-plans/{id} | subscription-plan/subscription-plan.service.ts | như trên |
| 22 | GET | /subscriptions/plans | subscription/subscription.api.ts | pages/admin/subscriptions/SubscriptionPlansPage.tsx |
| 23 | GET | /subscriptions/my-subscription | subscription/subscription.api.ts | SubscriptionPlansPage.tsx |
| 24 | POST | /subscriptions/checkout | subscription/subscription.api.ts | SubscriptionPlansPage.tsx |
| 25 | GET | /subscriptions/payments/{orderCode} | subscription/subscription.api.ts | pages/admin/subscriptions/SubscriptionPaymentPage.tsx |
| 26 | GET | /branches (public, page, size) | branch/branch.api.ts (`branchApi.getAll`) | pages/branch/components/branch-list.tsx |
| 27 | GET | /branches/search | branch/branch.api.ts | pages/branch/* |
| 28 | GET | /branches/{id} | branch/branch.api.ts | pages/branch/branch-detail-page.tsx, pages/branches/branch-form-page.tsx |
| 29 | GET | /branches/{id}/courts | branch/branch.api.ts | pages/branch/components/branch-courts.tsx, slot-booking |
| 30 | GET | /courts/{id}/daily-schedule?date | branch/branch.api.ts | pages/slot-booking/*, pages/time-slots/time-slot-list-page.tsx |
| 31 | GET | /branches (admin, có sort) | branch/branch.api.ts (`getBranches`) | pages/branches/branch-list-page.tsx, admin/vouchers |
| 32 | POST | /branches | branch/branch.api.ts | pages/branches/branch-form-page.tsx |
| 33 | PUT | /branches/{id} | branch/branch.api.ts | branch-form-page.tsx |
| 34 | DELETE | /branches/{id} | branch/branch.api.ts | branch-list-page.tsx |
| 35 | GET | /courts (page, lọc theo branch ở client) | court/court.api.ts | pages/courts/court-list-page.tsx, branches/branch-list-page.tsx |
| 36 | GET | /courts/{id} | court/court.api.ts | pages/courts/court-detail-page.tsx, court-form-page.tsx |
| 37 | POST | /courts | court/court.api.ts | court-form-page.tsx |
| 38 | PUT | /courts/{id} | court/court.api.ts | court-form-page.tsx |
| 39 | DELETE | /courts/{id} | court/court.api.ts | court-list-page.tsx |
| 40 | GET | /time-slot-templates | time-slot-template/time-slot-template.api.ts | pages/time-slots/time-slot-list-page.tsx |
| 41 | GET | /time-slot-templates/{id} | time-slot-template/time-slot-template.api.ts | pages/time-slots/time-slot-detail-page.tsx |
| 42 | GET | /time-slot-templates/court/{courtId} | time-slot-template/time-slot-template.api.ts, time-slot/time-slot.api.ts | time-slot pages, hooks/staff/use-court-slot-templates.ts |
| 43 | POST | /time-slot-templates (batch) | time-slot-template/time-slot-template.api.ts | pages/time-slots/time-slot-form-page.tsx |
| 44 | PUT | /time-slot-templates/{id} | time-slot-template/time-slot-template.api.ts | time-slot-form-page.tsx |
| 45 | DELETE | /time-slot-templates/{id} | time-slot-template/time-slot-template.api.ts | time-slot-list-page.tsx |
| 46 | POST | /time-slot-templates/apply/{courtId} | time-slot-template/time-slot-template.api.ts | time-slot-list-page.tsx |
| 47 | GET | /products | product/product.api.ts | pages/products/product-list-page.tsx, super-admin/products-page.tsx |
| 48 | GET | /products/{id} | product/product.api.ts | pages/products/product-form-page.tsx |
| 49 | POST | /branches/{branchId}/products | product/product.api.ts | product-form-page.tsx |
| 50 | PUT | /products/{id} | product/product.api.ts | product-form-page.tsx |
| 51 | DELETE | /products/{id} | product/product.api.ts | product-list-page.tsx |
| 52 | POST | /uploads/images?context= | upload/image-upload.api.ts | branch-form-page.tsx, court-form-page.tsx |
| 53 | GET | /vouchers | voucher/voucher.api.ts | pages/admin/vouchers/AdminVoucherPage.tsx |
| 54 | GET | /vouchers/{id} | voucher/voucher.api.ts | AdminVoucherPage.tsx |
| 55 | GET | /vouchers/code/{code} | voucher/voucher.api.ts | components/BookingSummary.tsx (khách nhập mã) |
| 56 | POST | /vouchers | voucher/voucher.api.ts | components/admin/VoucherFormModal.tsx |
| 57 | PUT | /vouchers/{id} | voucher/voucher.api.ts | VoucherFormModal.tsx |
| 58 | DELETE | /vouchers/{id} | voucher/voucher.api.ts | AdminVoucherPage.tsx |
| 59 | POST | /bookings | booking/booking.api.ts | pages/slot-booking/slot-booking-page.tsx |
| 60 | GET | /bookings/{id} | booking/booking.api.ts | pages/payment/ConfirmationPage.tsx |
| 61 | POST | /bookings/{id}/cancel | booking/booking.api.ts | pages/booking/my-bookings-page.tsx |
| 62 | GET | /bookings/my | booking/booking.api.ts | my-bookings-page.tsx |
| 63 | GET | /bookings/lookup?bookingCode&phone | booking/booking.api.ts | pages/booking/booking-lookup-page.tsx |
| 64 | GET | /bookings (admin, page) | admin/booking.service.ts | pages/admin/AdminBookingPage.tsx |
| 65 | PUT | /bookings/{id}/status | admin/booking.service.ts | AdminBookingPage.tsx, components/admin/BookingDetailModal.tsx |
| 66 | POST | /payments (multipart billImage) | booking/booking.api.ts | pages/payment/PaymentPage.tsx, components/UploadReceipt.tsx |
| 67 | GET | /payments/{id} | booking/booking.api.ts | PaymentPage.tsx, ConfirmationPage.tsx |
| 68 | GET | /payments (admin list) | payment/payment.api.ts | AdminVoucherPage.tsx (lịch sử dùng voucher) |
| 69 | POST | /payments/{id}/approve | admin/booking.service.ts | BookingDetailModal.tsx |
| 70 | POST | /payments/{id}/reject | admin/booking.service.ts | BookingDetailModal.tsx |
| 71 | GET | /refund-requests | refund/refund.api.ts | pages/admin/AdminRefundRequestsPage.tsx |
| 72 | POST | /refund-requests/{id}/confirm (multipart) | refund/refund.api.ts | AdminRefundRequestsPage.tsx |
| 73 | GET | /v1/branches/{id}/staff | staff/staff.api.ts | pages/staff/staff-page.tsx |
| 74 | GET | /v1/staff/me | staff/staff.api.ts | context/staff-session-context.tsx |
| 75 | GET | /v1/staff/{id} | staff/staff.api.ts | hàm có, chưa thấy trang gọi |
| 76 | POST | /v1/staff | staff/staff.api.ts | pages/staff/components/staff-form-modal.tsx |
| 77 | PATCH | /v1/staff/{id} | staff/staff.api.ts | staff-form-modal.tsx |
| 78 | DELETE | /v1/staff/{id} | staff/staff.api.ts | staff-page.tsx |
| 79 | GET | /v1/staff/schedule | staff/staff.api.ts | hooks/staff/use-today-schedule.ts |
| 80 | GET | /v1/staff/court-board | staff/staff.api.ts | pages/staff/staff-board-page.tsx |
| 81 | POST | /v1/staff/checkin | staff/staff.api.ts | hooks/staff/use-checkin.ts |
| 82 | POST | /v1/staff/walk-in-bookings | staff/staff.api.ts | hooks/staff/use-walk-in-booking.ts, pages/staff/staff-walk-in-page.tsx |
| 83 | POST | /v1/staff/checkout | staff/staff.api.ts | hooks/staff/use-checkout.ts |
| 84 | GET | /v1/staff/products | staff/staff.api.ts | pages/staff/staff-pos-page.tsx |
| 85 | POST | /v1/staff/orders | staff/staff.api.ts | staff-pos-page.tsx |
| 86 | POST | /v1/staff/orders/{id}/confirm | staff/staff.api.ts | staff-pos-page.tsx |
| 87 | GET | /v1/staff/orders | staff/staff.api.ts | staff-pos-page.tsx |
| 88 | GET | /admin/dashboard/stats | admin/admin-dashboard.service.ts | pages/admin/admin-dashboard-page.tsx |
| 89 | GET | /super-admin/dashboard/stats và /details | super_admin/super-admin-dashboard.service.ts | pages/super-admin/dashboard-page.tsx |

Ghi chú: dòng 89 gộp hai lời gọi (stats và details). Dòng 26 và 31 cùng path `/branches` nhưng hai ngữ cảnh (public và admin) ánh xạ sang endpoint khác nhau nên tách dòng.

## 2. Đối chiếu với backend microservice

Trạng thái:

* **Giống**: cùng path và method.
* **Đổi path**: cùng ý nghĩa nhưng path hoặc method khác.
* **Đổi contract**: cùng path nhưng body, response hoặc luồng khác.
* **Thiếu**: backend mới không có endpoint tương đương.

Path ghi theo dạng đi qua gateway, mọi service dùng prefix `/api/...` (mục 4.1). Điểm chung cho mọi dòng, không nhắc lại: response bỏ lớp bọc `{httpStatus,data,message,errorCode}`, và phân trang có ba kiểu khác nhau (mục 4.5).

### 2.1 Auth và tài khoản (auth-service)

Controller ở `be:auth-service/src/main/java/com/fcourt/auth/`.

| # web | Backend mới | Trạng thái | Khác biệt chính |
|---|---|---|---|
| 1 | POST /api/auth/login (`account/AuthController.java`) | Đổi contract | Response `{accessToken, refreshToken, tokenType, expiresIn (giây), user{id,email,fullName,phone,role,status,createdAt,avatarUrl}}` (`account/AccountDtos.java`, `AuthResponse`). Không còn `data`. |
| 2 | POST /api/auth/register/customer | Đổi contract | Body `fullName,email,phone,password` (phone theo regex `PHONE`, mật khẩu 8 đến 72 ký tự). Trả 201 với `AuthResponse` (tự đăng nhập). |
| 3 | POST /api/auth/register/court-owner | Đổi contract | Multipart `fullName,email,phone,password,legalDocuments[]` (bắt buộc), `courtImages[]` (tuỳ chọn). Trả `{id,status,message}`, chờ super admin duyệt. Cần so với form `RegisterAdminPage` của web. |
| 4 | POST /api/auth/refresh | Đổi contract | Body `{refreshToken}` giữ nguyên. Refresh token được xoay vòng (`account/SessionService.java`), response `AuthResponse` ở root. Thêm POST /api/auth/logout (204). |
| 5 | GET /api/auth/profile | Giống | Response thêm `avatarUrl`, `status` thêm `REJECTED`. |
| 6 | PATCH /api/auth/profile | Giống | Body `{fullName, phone}` như web. |
| 7 | PATCH /api/auth/password (`account/PasswordController.java`) | Giống | Body `{currentPassword,newPassword}` như web. |
| 8 | Không có GET danh sách mọi user. Chỉ có GET /api/super-admin/court-admins/pending (`superadmin/SuperAdminController.java`) | Thiếu | Trang quản lý user của super admin mất phần "tất cả user". |
| 9 | GET /api/super-admin/court-admins/{id} | Đổi path | Chỉ cho court admin. |
| 10 | PUT /api/super-admin/court-admins/{id}/approve (alias PUT /api/super-admin/users/{id}/approve) | Đổi path | PATCH đổi thành PUT. |
| 11 | PUT /api/super-admin/court-admins/{id}/reject | Đổi path | PATCH đổi thành PUT. |
| 12, 13 | PUT /api/super-admin/users/{id}/toggle-status | Đổi path | Gộp lock và unlock thành một toggle, không còn tham số `reason`. |

### 2.2 Subscription và court type (subscription-service)

Controller ở `be:subscription-service/src/main/java/com/fcourt/subscription/`.

| # web | Backend mới | Trạng thái | Khác biệt chính |
|---|---|---|---|
| 14 đến 17 | GET/POST /api/court-types, GET/PUT/DELETE /api/court-types/{id} (`courttype/CourtTypeController.java`) | Giống | Cần kiểm tra field và kiểu phân trang (web gửi `size=100`). |
| 18 đến 21 | GET/POST /api/subscription-plans, PUT/DELETE /api/subscription-plans/{id} (`plan/PlanController.java`) | Giống | Có thêm GET /api/subscription-plans/all (plan đang active) và GET /{id}. |
| 22 | GET /api/subscription-plans/all | Đổi path | `/subscriptions/plans` không còn trong `billing/BillingController.java`. |
| 23 | GET /api/subscriptions/my-subscription | Giống | |
| 24 | POST /api/subscriptions/checkout | Giống | Trả 201, cần kiểm tra body. |
| 25 | GET /api/subscriptions/payments/{orderCode} | Giống | |

### 2.3 Cơ sở vật chất (facility-service, discovery-service)

Controller ở `be:facility-service/src/main/java/com/fcourt/facility/api/` và `be:discovery-service/src/main/java/com/fcourt/discovery/controller/`.

| # web | Backend mới | Trạng thái | Khác biệt chính |
|---|---|---|---|
| 26, 27 | GET /api/public/branches (discovery `BranchController.java`) | Đổi path | Gộp list và search. Query: `query,city,district,courtTypeId,minPrice,maxPrice,latitude,longitude,page,size,hasAvailableSlotsToday,timeSlot`. Response `{content,page,size,totalElements,totalPages}`, phần tử `{id,name,address,city,district,latitude,longitude,minPrice,maxPrice,courtCount,distanceKm,averageRating,reviewCount}` (`dto/response/BranchSearchResponse.java`). Không còn `adminName`, `sampleImageUrl`, `courtTypeNames`, thông tin ngân hàng. |
| 28 | GET /api/public/branches/{id} (facility `BranchController.java`) | Đổi path | Thêm `district, latitude, longitude, slotDurationMinutes, courtCount, images[]` (`BranchResponse.java`). Ảnh còn lấy được ở GET /api/public/branches/{id}/images. |
| 29 | GET /api/public/branches/{branchId}/courts (`CourtController.java`) | Đổi path | |
| 30 | GET /api/public/courts/{courtId}/slots?date= (discovery `CourtSlotController.java`) | Đổi path | Phần tử `{slotId,startTime,endTime,price,status,restriction?}`, status `AVAILABLE,HOLD,BOOKED,OUT_OF_SERVICE,EXPIRED` (`dto/response/CourtSlotResponse.java`). Web cũ dùng `HOLDING` và không có `slotId`; slot giờ được giữ và đặt bằng `slotId`. |
| 31 | GET /api/admin/branches | Đổi path | Prefix `/admin`, trả branch của chính owner. |
| 32 | POST /api/admin/branches | Đổi contract | Bắt buộc `bankName, bankBin (6 số), bankAccountNumber, bankAccountName`, có thêm `district`, toạ độ, `slotDurationMinutes` (`BranchRequest.java`). `sampleImageUrl` và `bankQrImageUrl` cũ thay bằng bộ ảnh `images`. |
| 33 | PUT /api/admin/branches/{id} | Đổi contract | Như trên. |
| 34 | DELETE /api/admin/branches/{id} | Đổi path | |
| 35 | GET /api/admin/branches/{branchId}/courts | Đổi path | Không còn danh sách court toàn cục, lọc theo branch ở server. |
| 36 | GET /api/admin/courts/{id} | Đổi path | |
| 37 | POST /api/admin/branches/{branchId}/courts | Đổi contract | `branchId` vào path. Body `{name,courtTypeId,description,imageUrl,defaultPricePerHour,status}`, `status` thêm `MAINTENANCE` (`CourtRequest.java`). |
| 38 | PUT /api/admin/courts/{id} (và PATCH /{id}/status) | Đổi contract | Như trên. |
| 39 | DELETE /api/admin/courts/{id} | Đổi path | |
| 40 | Không có GET danh sách template toàn cục | Thiếu | Chỉ có GET theo court. |
| 41 | Không có GET template theo id | Thiếu | |
| 42 | GET /api/admin/courts/{courtId}/time-slot-templates (`TemplateController.java`) | Đổi path | |
| 43 | POST /api/admin/courts/{courtId}/time-slot-templates | Đổi contract | Template theo court. Có thêm `.../time-slot-templates/preview`. |
| 44 | Không có PUT template | Thiếu | Muốn sửa phải xóa và tạo lại. |
| 45 | DELETE /api/admin/time-slot-templates/{id} | Đổi path | |
| 46 | POST /api/admin/courts/{courtId}/apply-template | Đổi path | Có thêm bulk-apply (preview và apply). |

### 2.4 Sản phẩm POS (pos-retail-service)

Controller ở `be:pos-retail-service/src/main/java/com/fcourt/pos/api/PosController.java`.

| # web | Backend mới | Trạng thái | Khác biệt chính |
|---|---|---|---|
| 47 | GET /api/staff/pos/products | Đổi path | Query `query,category,limit,offset`. Chưa có endpoint admin liệt kê sản phẩm riêng (dùng catalog của staff). |
| 48 | Không có GET sản phẩm theo id | Thiếu | |
| 49 | POST /api/admin/pos/products | Đổi path | Không còn `branchId` trong path (cần kiểm tra body). |
| 50 | PUT /api/admin/pos/products/{id} | Đổi path | Có thêm POST /{id}/stock-adjustments. |
| 51 | Không có DELETE sản phẩm | Thiếu | |
| 52 | Không có `/uploads/images` | Thiếu | Ảnh upload theo mục đích: ảnh branch (POST /api/admin/branches/{id}/images), ảnh review (POST /api/reviews/images), avatar (PUT /api/auth/profile/avatar), biên lai. Ảnh court và ảnh sản phẩm chỉ là chuỗi `imageUrl`, chưa có API upload. |

### 2.5 Voucher (voucher-service)

Controller ở `be:voucher-service/src/main/java/com/fcourt/voucher/`.

| # web | Backend mới | Trạng thái | Khác biệt chính |
|---|---|---|---|
| 53 | GET /api/admin/vouchers?branchId (`VoucherController.java`) | Đổi path | Response `{items,page,size,total}`. |
| 54 | GET /api/admin/vouchers/{id} | Đổi path | |
| 55 | POST /api/vouchers/apply `{code,bookingId,totalAmount}` (`VoucherApplyController.java`) | Đổi contract | Không tra mã theo `code` nữa. Khách áp mã lên booking đã tạo, trả `{applicationId, voucherId, bookingId, originalAmount, ...}`. |
| 56 | POST /api/admin/vouchers | Đổi contract | Body `code (A-Z0-9_-), branchId (bắt buộc), discountType, discountValue, maxDiscountAmount, minOrderAmount, startDate, endDate (Instant), usageLimit, ...` (`VoucherRequest.java`). |
| 57 | PUT /api/admin/vouchers/{id} | Đổi path | |
| 58 | DELETE /api/admin/vouchers/{id} | Đổi path | |

### 2.6 Booking, payment, refund (booking-service, payment-service, slot-hold-engine)

Controller ở `be:booking-service/src/main/java/com/fcourt/booking/`, `be:payment-service/src/main/java/com/fcourt/payment/`, `be:slot-hold-engine/src/main/java/com/fcourt/hold/`.

| # web | Backend mới | Trạng thái | Khác biệt chính |
|---|---|---|---|
| 59 | (1) POST /api/bookings/hold-slots `{courtId,date,slotIds,guestPhone}` (`HoldController.java`), sau đó (2) POST /api/bookings với header `Idempotency-Key` (UUID) và body `{holdToken,courtId,date,slotIds}` (`OnlineBooking.java`) | Đổi contract | Hold trả `{holdToken, expiresAt, expiresInSeconds, courtId, date, slotIds}`, TTL khoảng 300 giây (`be:slot-hold-engine/README.md`). Mỗi booking một court một ngày, tối đa 48 slot. Web cũ tạo nhiều booking một lần với `slotStarts`. |
| 60 | GET /api/bookings/{id} | Giống | Response `BookingView` (branch, slots, `checkInCode`, `qrImageUrl`, `receiptImageUrl`, `paymentStatus`, voucher, `refundAmount`, ...) (`BookingView.java`). |
| 61 | POST /api/bookings/{id}/cancel (`BookingCancellationController.java`) | Giống | Thêm GET /api/bookings/{id}/cancellation-policy để báo trước số tiền hoàn. |
| 62 | GET /api/bookings/my | Giống | Response `{items,page,size,total}`. |
| 63 | Không có tra cứu theo `bookingCode + phone` | Thiếu | Khách vãng lai không tra được bằng mã (cần quyết định). |
| 64 | GET /api/admin/bookings (`AdminBookingController.java`) | Đổi path | Response `{items,page,size,total}`. |
| 65 | Không có đổi trạng thái booking thủ công | Thiếu | Trạng thái đi theo luồng: xác nhận hoặc từ chối thanh toán, hủy, check-in, checkout. |
| 66 | POST /api/payments/{bookingId}/upload-receipt, multipart part `file` (`ReceiptController.java`) | Đổi contract | Từng booking một, không còn `bookingIds[]`, `amount`, `voucherCode`. Gọi trước GET /api/payments/checkout-info/{bookingId} (`CheckoutController.java`) để lấy thông tin chuyển khoản. Booking miễn phí (voucher 100 phần trăm): POST /api/payments/{bookingId}/confirm-free. |
| 67 | GET /api/payments/{bookingId}/status | Đổi path | Khoá là `bookingId`, không phải paymentId. |
| 68 | GET /api/admin/payments/transactions?branchId&transactionType&fromDate&toDate&status&search&page&size (`UnifiedLedgerController.java`, `BranchLedgerController.java`) | Đổi path | Không còn filter `hasVoucher`. |
| 69 | PUT /api/admin/payments/{paymentId}/confirm (`PaymentApprovalController.java`) | Đổi path | POST đổi thành PUT. Thêm GET /api/admin/payments/pending. |
| 70 | PUT /api/admin/payments/{paymentId}/reject | Đổi path | |
| 71 | GET /api/admin/refunds/pending?branchId&page&size (`AdminRefundController.java`) | Đổi path | Trả mảng `RefundView`, không còn filter `status`. |
| 72 | PUT /api/admin/refunds/{id}/complete, multipart `file` | Đổi contract | Quy trình 3 bước: approve (PUT /{id}/approve), reject (PUT /{id}/reject với `{reason}`), complete (upload chứng từ). Web cũ chỉ có bước confirm kèm ảnh. |

### 2.7 Staff operations và POS (staff-operations-service, pos-retail-service)

Controller ở `be:staff-operations-service/src/main/java/com/fcourt/staff/api/`.

| # web | Backend mới | Trạng thái | Khác biệt chính |
|---|---|---|---|
| 73 | GET /api/admin/staff?branchId&limit&offset (`StaffController.java`) | Đổi path | Phân trang `limit/offset`, không còn `page/size/sort`. |
| 74 | GET /api/staff/me | Đổi path | |
| 75 | Không có GET staff theo id (có GET /api/admin/staff/accounts/{userId}) | Thiếu | |
| 76 | POST /api/admin/staff | Đổi path | Việc tạo tài khoản đăng nhập do auth-service xử lý qua route nội bộ `/api/internal/staff-accounts` (`be:auth-service/.../staff/StaffAccountController.java`), web không gọi trực tiếp. |
| 77 | PUT /api/admin/staff/{id} | Đổi path | PATCH đổi thành PUT. |
| 78 | DELETE /api/admin/staff/{id} | Đổi path | Là vô hiệu hóa, thêm POST /{id}/reactivate. |
| 79 | GET /api/staff/schedule?startDate&endDate (`WeekScheduleController.java`) và GET /api/staff/schedule/today (`CheckInController.java`) | Đổi path | Lịch theo tuần ISO (Monday=1). |
| 80 | GET /api/staff/branches/{branchId}/courts (`be:facility-service/.../CourtController.java`) | Đổi contract | Không có endpoint "court board" riêng, cần ghép court (facility) với slot (public slots). Cần kiểm tra thêm. |
| 81 | POST /api/staff/check-in/verify, /preview, /manual (`CheckInController.java`) | Đổi contract | Body `{checkInCode}`, tách bước preview và xác nhận. Thêm check-in offline: GET /api/staff/offline/tickets, POST /api/staff/check-in/offline (`OfflineCheckInController.java`). |
| 82 | POST /api/staff/walk-in `{courtId,date,slotIds,guestPhone,guestName?}` (`WalkInController.java`) | Đổi contract | Dùng `slotIds` thay vì giờ. |
| 83 | PUT /api/staff/bookings/{id}/checkout và GET .../checkout-preview | Đổi contract | Có bước preview. |
| 84 | GET /api/staff/pos/products | Đổi path | |
| 85 | POST /api/staff/pos/orders | Đổi path | |
| 86 | Không có bước confirm đơn POS riêng | Thiếu | Cần hỏi team POS: đơn có vẻ được tạo và chốt trong một lần (`/api/internal/pos/settlements` là nội bộ). |
| 87 | GET /api/staff/pos/orders (và GET /{id}) | Đổi path | Dùng `limit/offset`, không thấy filter `date` (cần kiểm tra). |

### 2.8 Dashboard (reporting-service)

| # web | Backend mới | Trạng thái | Khác biệt chính |
|---|---|---|---|
| 88 | GET /api/admin/dashboard/stats?branchId (`be:reporting-service/src/main/java/com/fcourt/reporting/api/DashboardController.java`) | Giống | Cần kiểm tra field. |
| 89 | GET /api/super-admin/dashboard/overview (`.../SuperAdminDashboardController.java`) | Đổi path | `stats` và `details` gộp thành `overview`. Số liệu tài khoản: GET /api/super-admin/stats/accounts, /owner-names (auth-service). Doanh thu SaaS: GET /api/super-admin/stats/saas-revenue (`be:subscription-service/.../stats/SaasRevenueController.java`). |

## 3. Chức năng mới ở backend nhưng web cũ chưa dùng

Cột "Monolith cũ" cho biết endpoint thật sự mới (chưa từng có) hay chỉ là web chưa dùng. Kiểm tra bằng `old-be:controller/*.java` và tìm từ khóa trong `old-be:`: không có "forgot", "google", "review", "ticket", "ledger", "stock", "websocket", "avatar", "export".

### 3.1 Bảng chức năng

| Nhóm | Endpoint (qua gateway) | File backend mới | Monolith cũ |
|---|---|---|---|
| Hold slot | POST /api/bookings/hold-slots, DELETE /api/bookings/hold-slots/{holdToken} | `be:slot-hold-engine/src/main/java/com/fcourt/hold/HoldController.java` | Mới hoàn toàn |
| Realtime slot | WebSocket STOMP `/ws-fcourt`, subscribe `/topic/court-slots/{courtId}`, payload `{courtId,date,type[,lockType]}`. Chỉ là tín hiệu invalidate, client phải gọi lại HTTP khi connect, reconnect và định kỳ | `be:booking-service/src/main/java/com/fcourt/booking/SlotWebSocket.java`, `be:docs/SCRUM-108.md` | Mới hoàn toàn. Chỉ bật khi `booking.realtime.enabled=true`, origin lấy từ `booking.realtime.allowed-origins` |
| Đặt sân | GET /api/bookings/{id}/cancellation-policy | `be:booking-service/.../BookingCancellationController.java` | Mới |
| Thanh toán khách | GET /api/payments/checkout-info/{bookingId}, GET /api/payments/{bookingId}/ticket, GET .../ticket/qr, POST .../confirm-free, GET /api/payments/my-transactions | `be:payment-service/src/main/java/com/fcourt/payment/{CheckoutController,TicketController,FreeVoucherPaymentController,CustomerPaymentsController}.java` | Mới (monolith chỉ có CRUD `/payments`) |
| Hoàn tiền khách | POST /api/refunds/request, GET /api/refunds/booking/{bookingId} | `be:payment-service/.../RefundController.java` | Mới. Monolith chỉ có phía admin (`old-be:controller/RefundRequestController.java`) |
| Hoàn tiền admin | GET pending, PUT approve, reject, complete | `be:payment-service/.../AdminRefundController.java` | Một phần cũ (confirm), approve và reject mới |
| Duyệt thanh toán | GET /api/admin/payments/pending, PUT confirm, reject | `be:payment-service/.../PaymentApprovalController.java` | Cũ, đổi path và method |
| Sổ giao dịch | GET /api/admin/payments/transactions | `be:payment-service/.../{UnifiedLedgerController,BranchLedgerController}.java` | Mới (monolith chỉ liệt kê payment) |
| Review | POST /api/reviews, POST /api/reviews/images, GET /api/public/branches/{id}/reviews, POST /api/admin/reviews/{id}/reply | `be:discovery-service/.../controller/ReviewController.java` | Mới |
| Ảnh branch | GET/POST /api/admin/branches/{id}/images, DELETE /api/admin/branches/images/{imageId}, GET /api/public/branches/{id}/images | `be:facility-service/.../api/BranchImageController.java` | Mới (monolith chỉ có một `sampleImageUrl`) |
| Giá theo khung giờ | GET/POST/PUT/DELETE /api/admin/courts/{courtId}/pricing-rules, POST .../copy-weekday-to-weekend | `be:facility-service/.../api/PricingController.java` | Mới ở tầng API (monolith có `CourtPricingService` nhưng không có controller) |
| Khóa slot, bảo trì | POST/GET/DELETE /api/admin/courts/lock-slots, POST/DELETE /api/admin/courts/out-of-service | `be:facility-service/.../api/LockController.java` | Mới |
| Template hàng loạt | POST /api/admin/courts/bulk-apply-template (và preview), preview theo court | `be:facility-service/.../api/TemplateController.java` | Mới |
| Đặt cả sân (admin) | POST /api/admin/bookings/full-court (kèm quote, list, get, cancel, relock) | `be:booking-service/.../FullCourtQuote.java` | Mới |
| Voucher | POST /api/vouchers/apply, GET /api/admin/vouchers/{id}/usages | `be:voucher-service/.../{VoucherApplyController,VoucherUsageController}.java` | Apply mới (monolith tra theo code), usages mới |
| Staff | GET /api/staff/schedule và /today, POST check-in verify, preview, manual, offline, GET offline/tickets, POST walk-in, checkout-preview, checkout, GET /api/staff/branches/{id} và /courts | `be:staff-operations-service/.../api/*.java` | Một phần cũ (check-in, walk-in, checkout), offline và preview mới |
| POS | POST /api/admin/pos/products/{id}/stock-adjustments, GET /api/staff/pos/orders/{id} | `be:pos-retail-service/.../PosController.java` | Mới (quản lý tồn kho) |
| Reporting | GET /api/admin/dashboard/revenue-chart, /analytics/top-courts, /analytics/peak-hours, /export/revenue (xlsx) | `be:reporting-service/.../api/{AnalyticsController,ExportController}.java` | Mới |
| Auth | POST /api/auth/google, /logout, /password/forgot, /password/reset, PUT và DELETE /api/auth/profile/avatar | `be:auth-service/.../account/{GoogleLoginController,AuthController,PasswordController,AvatarController}.java` | Mới |
| Super admin | GET /api/super-admin/stats/accounts, /owner-names, /saas-revenue | `be:auth-service/.../superadmin/PlatformStatsController.java`, `be:subscription-service/.../stats/SaasRevenueController.java` | Mới |
| Thông báo | Không có REST ngoài `/actuator/health`: chỉ gửi email (owner được duyệt, đặt lại mật khẩu, booking xác nhận hoặc hủy). `/devices` (đăng ký thiết bị push) mới có ở nhánh `feature/Nguyen_push-device-registry`, chưa vào `dev` | `be:notification-service/README.md` | Mới. Web không có việc ở đây, ngoài trang nhận link đặt lại mật khẩu (biến `NOTIFICATION_RESET_PASSWORD_URL`) |

Endpoint nội bộ `/api/internal/**` (29 endpoint trong booking, facility, discovery, auth, payment, pos, slot-hold-engine) là giao tiếp giữa các service bằng token service, web không được gọi.

### 3.2 Chức năng web cũ có mà backend mới chưa có

Gom từ các dòng "Thiếu" ở mục 2 để team quyết định giữ hoặc bỏ:

1. Danh sách toàn bộ user, lọc theo role cho super admin (dòng 8).
2. Tra cứu booking bằng `bookingCode + phone` cho khách vãng lai (dòng 63).
3. Upload ảnh chung `/uploads/images` cho court, sản phẩm, QR ngân hàng (dòng 52).
4. Đổi trạng thái booking thủ công (dòng 65).
5. Xem chi tiết và xóa sản phẩm POS (dòng 48, 51).
6. Sửa, xem lẻ, liệt kê toàn bộ time slot template (dòng 40, 41, 44).
7. GET chi tiết staff theo id (dòng 75).
8. Bước confirm đơn POS riêng (dòng 86).

### 3.3 Hạng mục việc frontend đề xuất

Mỗi hạng mục giao được cho một người. Cỡ: S (dưới 2 ngày), M (2 đến 5 ngày), L (hơn 5 ngày). F0 phải xong trước mọi hạng mục khác.

| ID | Tên | Role | Endpoint | Cỡ | Phụ thuộc |
|---|---|---|---|---|---|
| F0 | Nền tảng: đổi client sang API mới (bỏ envelope, token và JWT, refresh, lỗi RFC 7807, CORS hoặc proxy, base URL gateway, logout) | tất cả | /api/auth/login, /refresh, /logout, /profile (mục 4) | M | Gateway xác nhận route |
| F1 | Khám phá sân: tìm branch có bộ lọc, chi tiết branch, ảnh, danh sách court, review (đọc) | customer | GET /api/public/branches, /{id}, /{id}/images, /{id}/courts, /{id}/reviews | M | F0 |
| F2 | Chọn slot và giữ chỗ: lưới slot theo `slotId`, hold slot kèm đếm ngược, WebSocket cập nhật slot | customer | GET /api/public/courts/{id}/slots, POST và DELETE /api/bookings/hold-slots, WS /ws-fcourt | L | F0, F1 |
| F3 | Tạo booking và thanh toán chuyển khoản: tạo booking có `Idempotency-Key`, checkout-info, upload biên lai, trạng thái thanh toán, đặt miễn phí | customer | POST /api/bookings, GET /api/payments/checkout-info/{id}, POST .../upload-receipt, GET .../status, POST .../confirm-free | L | F2 |
| F4 | Áp voucher cho khách | customer | POST /api/vouchers/apply | S | F3 |
| F5 | Booking của tôi: danh sách, chi tiết, vé QR, chính sách hủy, hủy, yêu cầu hoàn tiền, lịch sử giao dịch, viết review | customer | GET /api/bookings/my, /{id}, /cancellation-policy, POST /cancel, GET .../ticket, .../ticket/qr, POST /api/refunds/request, GET /api/refunds/booking/{id}, GET /api/payments/my-transactions, POST /api/reviews, /api/reviews/images | M | F0 |
| F6 | Tài khoản: quên và đặt lại mật khẩu, đăng nhập Google, avatar | customer, owner | POST /api/auth/password/forgot, /reset, POST /api/auth/google, PUT và DELETE /api/auth/profile/avatar | S | F0 |
| F7 | Quản lý branch và court (owner): CRUD branch, ảnh branch, CRUD court, trạng thái court | court owner | /api/admin/branches/**, /api/admin/branches/{id}/images, /api/admin/branches/{branchId}/courts, /api/admin/courts/{id}, PATCH .../status | M | F0; ảnh court cần quyết định mục 3.2 điểm 3 |
| F8 | Giá và lịch sân: pricing rules, time slot template (preview, apply, bulk), khóa slot, bảo trì | court owner | /api/admin/courts/{id}/pricing-rules/**, /time-slot-templates, /apply-template, /bulk-apply-template, /lock-slots, /out-of-service | L | F7 |
| F9 | Duyệt thanh toán, sổ giao dịch, hoàn tiền, đặt cả sân | court owner | /api/admin/bookings, /api/admin/payments/pending, /confirm, /reject, /transactions, /api/admin/refunds/**, /api/admin/bookings/full-court/** | L | F0, F7 |
| F10 | Voucher owner: CRUD voucher và lịch sử dùng | court owner | /api/admin/vouchers/**, /{id}/usages | S | F7 |
| F11 | Nhân viên và sản phẩm POS (owner): CRUD staff, kích hoạt lại, CRUD sản phẩm, điều chỉnh tồn kho | court owner | /api/admin/staff/**, /api/admin/pos/products/**, /stock-adjustments | M | F7 |
| F12 | Dashboard owner: stats, biểu đồ doanh thu, top court, giờ cao điểm, xuất xlsx, trả lời review | court owner | /api/admin/dashboard/**, POST /api/admin/reviews/{id}/reply | M | F7 |
| F13 | Vận hành quầy (staff): lịch tuần và hôm nay, check-in QR (verify, preview, manual, offline), walk-in, checkout có preview, POS bán lẻ | staff | /api/staff/** (schedule, check-in, offline, walk-in, checkout), /api/staff/pos/** | L | F0 |
| F14 | Gói dịch vụ và quản trị nền tảng: mua subscription (owner); duyệt owner, bật tắt user, court type, plan, dashboard, doanh thu SaaS (super admin) | court owner, super admin | /api/subscription-plans/**, /api/subscriptions/**, /api/court-types/**, /api/super-admin/** | M | F0; quyết định mục 3.2 điểm 1 |

Gợi ý chia người: nhóm customer là F1 đến F6 (F2 và F3 nên cùng một người), nhóm owner F7 đến F12, nhóm staff F13, nhóm admin F14.

## 4. Thay đổi bắt buộc để web nói chuyện được với backend mới

### 4.1 Base URL, gateway và prefix

* Web cũ: `VITE_API_URL` mặc định `/api` (`web:src/common/config/env.ts`), nginx proxy `location /api/` sang một upstream `http://backend:8080` (`web:nginx.conf`). Mọi path trong `api-endpoints.ts` viết không kèm `/api`.
* Backend mới: mỗi service có route riêng, tất cả bắt đầu bằng `/api/...`, ngoại lệ `/.well-known/jwks.json` (auth) và WebSocket `/ws-fcourt` (booking, không nằm dưới `/api`).
* Trong `be:` không có cấu hình gateway thật. Việc phân route theo path nằm ở `fcourt-gitops/services/*/` (ALB ingress, ví dụ auth-service map `/api/auth`, booking-service `/api/bookings`, payment-service `/api/payments`, subscription-service `/api/subscriptions`, voucher-service `/api/vouchers`; các service còn lại chưa thấy patch path trong thư mục này). Bài test hệ thống nói đến "một gateway" (`be:tools/system_tests/README.md`). Flutter dev dùng port riêng từng service (`flutter:env/dev.json`: 8080 chung, discovery 8085, facility 8083, subscription 8082, reporting 8084), prod dùng một `API_BASE_URL` (`flutter:env/prod.json`).
* Việc cần làm: xác nhận với team hạ tầng route cho đủ các prefix `/api/public`, `/api/admin`, `/api/staff`, `/api/super-admin`, `/api/court-types`, `/api/subscription-plans`, `/api/reviews`, `/api/refunds`, `/api/vouchers` và `/ws-fcourt`. Phía web: giữ `VITE_API_URL` kết thúc bằng `/api` và viết path mới không kèm `/api` (ví dụ `public/branches`), hoặc đổi env thành origin gateway và thêm `/api` vào mọi path. Cả hai đều phải sửa `nginx.conf` để proxy sang gateway và thêm `location /ws-fcourt` (upgrade WebSocket, `proxy_read_timeout` lớn hơn heartbeat, mẫu ở `be:docs/SCRUM-108.md`). Thêm biến `VITE_WS_URL` cho WebSocket.

### 4.2 Token và đăng nhập

| Thành phần | Web cũ | Backend mới | Nguồn |
|---|---|---|---|
| Response login và refresh | `{httpStatus, data:{accessToken, refreshToken, expiresIn}}` | JSON ở root `{accessToken, refreshToken, tokenType, expiresIn, user}` | `web:src/types/auth.ts`; `be:auth-service/src/main/java/com/fcourt/auth/account/AccountDtos.java` |
| `expiresIn` | mốc tuyệt đối tính bằng ms (`System.currentTimeMillis() + accessTokenExpirationMs`) | số giây của access token (mặc định 15 phút; refresh TTL 30 ngày) | `old-be:service/impl/AuthServiceImpl.java:123`; `be:auth-service/src/main/resources/application.yml:54-55`; `.../token/AccessTokenIssuer.java` |
| Claim JWT | `u_id`, `u_role`, `email` | `sub` = userId (số), `roles` = mảng một role, có issuer và audience, không có email | `web:src/utils/token.ts` (`decodeJwt`); `.../token/AccessTokenIssuer.java` |
| Ký | Bearer trong `Authorization` | giống, RS256, public key ở `/.well-known/jwks.json` | `.../token/JwksController.java` |
| Role | `CUSTOMER, ADMIN, SUPER_ADMIN, STAFF` | giống; `ADMIN` là court owner | `.../user/UserRole.java` |
| Status user | `PENDING_APPROVAL, ACTIVE, INACTIVE, LOCKED` | thêm `REJECTED` | `.../user/UserStatus.java` |
| Refresh | POST `/auth/refresh` `{refreshToken}`, không xoay vòng | cùng body nhưng refresh token xoay vòng, phải lưu token mới sau mỗi lần refresh | `.../account/SessionService.java` |
| Logout | không có | POST `/api/auth/logout` `{refreshToken}` (204, idempotent) | `.../account/AuthController.java` |

Ảnh hưởng trực tiếp lên code web:

* `tokenStorage.setTokens` dùng `tokens.expiresIn` như mốc epoch ms để đặt hạn cookie (`web:src/utils/token.ts`, hàm `setCookie`). Với giá trị là số giây, cookie hết hạn ngay (năm 1970) nên web không giữ được phiên. Phải đổi thành `Date.now() + expiresIn * 1000`.
* `decodeJwt` đọc `u_id/u_role/email`. Phải đổi sang `sub` và `roles[0]`; email và fullName lấy từ `user` trong response hoặc GET `/api/auth/profile`.
* Interceptor refresh (`web:src/services/http/axios-client.ts`) đọc `response.data.data`; phải đọc `response.data`. Flutter đã xử lý cả hai dạng (`flutter:lib/core/network/auth_interceptor.dart`, hàm `_tokenPayload`).
* Test hiện có gắn với định dạng cũ: `web:src/utils/token.test.ts`, `web:src/services/auth/auth.service.test.ts`, `web:src/services/http/axios-client.test.ts`.

### 4.3 CORS

* Không có cấu hình CORS cho HTTP ở service nào trong `be:` (tìm "cors" và "allowedOrigin" chỉ thấy cấu hình origin của WebSocket ở `be:booking-service/src/main/java/com/fcourt/booking/SlotWebSocket.java`, biến `booking.realtime.allowed-origins`, mặc định `http://localhost:3000`).
* Hệ quả: gọi thẳng từ trình duyệt sang origin khác sẽ bị chặn. Hai cách: (a) web phục vụ cùng origin với gateway và proxy `/api/` và `/ws-fcourt` như `nginx.conf` hiện tại (khuyến nghị, giống cách web cũ chạy); (b) gateway thêm CORS cho origin của web. Với WebSocket cần thêm origin của web vào `SLOT_ALLOWED_ORIGINS` (`be:docs/SCRUM-108.md`). Khi chạy `npm run dev` trên localhost cần proxy của Vite (`web:vite.config.ts`) hoặc CORS ở gateway.

### 4.4 Định dạng lỗi

* Web cũ đọc `error.response.data.message` từ envelope `{httpStatus, errorCode, message}` (`web:src/common/utils/api-error.ts`).
* Backend mới trả RFC 7807 `application/problem+json` `{type,title,status,detail,instance}` (`be:auth-service/src/main/java/com/fcourt/auth/common/ProblemResponses.java`, `ApiExceptionHandler.java`; cùng kiểu ở facility và các service khác). Phải đọc `detail`. Lỗi 401 và 403 từ security filter cũng theo dạng này.

### 4.5 Phân trang, header và quy ước dữ liệu

* Ba kiểu phân trang: discovery `{content,page,size,totalElements,totalPages}`; booking, voucher, payment `{items,page,size,total}`; staff và POS dùng `limit/offset`; refund pending và payment pending trả mảng. Web cũ chuẩn hóa kiểu Spring (`content, totalElements, number`) ở `web:src/services/branch/branch.api.ts` (`normalizePage`), cần một adapter chung.
* `Idempotency-Key` (UUID) bắt buộc ở POST `/api/bookings`: sinh một lần cho mỗi lần thử đặt và dùng lại khi retry. Một số lệnh staff cũng yêu cầu (`be:booking-service/.../StaffAdmissionController.java`).
* Slot dùng `slotId` (từ GET `/api/public/courts/{id}/slots`) cho hold, booking và walk-in; web cũ dùng `slotStarts` (giờ bắt đầu).
* Múi giờ nghiệp vụ `Asia/Ho_Chi_Minh`; template slot đánh số ngày Sunday=0, lịch staff dùng Monday=1 (`be:tools/system_tests/README.md`).
* Giờ branch trả dạng `HH:mm`; thời điểm (`expiresAt`, `startDate`, `endDate`) là `Instant` UTC ISO.

### 4.6 Danh sách việc nền tảng (nằm trong F0)

1. Bỏ `ApiResponse` và `requireData`, đọc dữ liệu trực tiếp ở root; sửa xử lý lỗi theo RFC 7807.
2. Sửa `tokenStorage` (`expiresIn` giây, claim `sub` và `roles`) và interceptor refresh (xoay vòng refresh token, đọc root).
3. Cập nhật `api-endpoints.ts` theo bảng mục 2 và thêm `VITE_WS_URL`.
4. Cập nhật `nginx.conf` (upstream gateway, `/ws-fcourt`), `vite.config.ts` (proxy dev) và `.env.example`.
5. Viết lại các test token và axios-client cho định dạng mới.
6. Xác nhận với team backend các điểm còn mở: route gateway, CORS, các mục "Thiếu" ở mục 3.2.

## 5. Độ tin cậy và điểm còn mở

* Danh sách endpoint backend quét bằng annotation nên có thể bỏ sót route khai báo bằng cấu hình hoặc `@RequestMapping(method=...)`. Chưa chạy thử hệ thống tích hợp.
* Chưa so từng field của mọi DTO; các dòng ghi "cần kiểm tra" cần đối chiếu khi làm hạng mục tương ứng.
* Nhánh `feature/Nguyen_push-device-registry` (đăng ký thiết bị push) chưa vào `dev` nên không tính vào số endpoint.
* Bộ test của web hiện có 1 test fail từ trước khi tách repo: `src/utils/token.test.ts` ("uses a one-day access cookie when the token expiry is already past") mong đợi cookie access hết hạn sau 1 ngày khi `expiresIn` đã quá hạn, nhưng `tokenStorage.setTokens` trong `src/utils/token.ts` chưa có nhánh đó. Lỗi này nằm cùng chỗ với thay đổi `expiresIn` ở mục 4.2 và nên xử lý trong F0.
