# Frontend - VéXeOnline (React + Vite + TanStack Query)

## Chạy thử
```bash
cp .env.example .env     # Windows: copy .env.example .env
npm install
npm run dev              # mở http://localhost:5173
```
`VITE_USE_MOCK=true` (mặc định): chạy bằng dữ liệu giả, **không cần backend**.
Khi backend xong: đặt `VITE_USE_MOCK=false` và `VITE_API_BASE_URL=http://localhost:8080/api`.

Tài khoản thử: khách `a@example.com / 123456`, admin `admin@example.com / admin123`.

Kiểm tra code: `npm run lint` và `npm run build`.

## Phần FE1
| Hạng mục | File chính |
|---|---|
| Đăng nhập / Đăng ký / Đăng xuất | `pages/auth/`, `contexts/AuthContext.jsx` |
| Chặn trang theo đăng nhập / quyền admin | `routes/ProtectedRoute.jsx`, `routes/AdminRoute.jsx` |
| Trang chủ, Tìm chuyến, Lọc, Sắp xếp | `pages/customer/Home.jsx`, `SearchTrips.jsx`, `utils/tripFilters.js` |
| Hồ sơ cá nhân | `pages/customer/Profile.jsx` |
| Dashboard admin | `pages/admin/Dashboard.jsx` |
| Gọi API / dữ liệu giả | `services/*.js`, `services/mockData.js` |
| useQuery / useMutation | `queries/*.js` và các page |

Xem `GIAI_THICH_CODE.md` để hiểu luồng chạy và các câu hỏi thường gặp khi bảo vệ.

## Dùng chung cho FE2 / FE3
- `useAuth()` trả về `{ user, isAuthenticated, isAdmin, login, register, logout, updateUser }`.
- `services/apiClient.js` tự gắn `Authorization: Bearer <token>` vào mọi request.
- `queries/tripQueries.js` có sẵn `useTrip(id)` cho trang chi tiết chuyến.
- Các route của FE2/FE3 trong `routes/AppRoutes.jsx` đang là `PlaceholderPage`, chỉ cần thay `element`.
- Component dùng chung: `components/common/` (Spinner, ErrorState, EmptyState, Alert, TripCard, SearchForm, Icon).

## API mà FE1 đang dùng (đề xuất cho backend)
```
POST /auth/register   { username, email, password }  ->  { token, user }
POST /auth/login      { email, password }            ->  { token, user }
PUT  /users/me        { fullName, phone }            ->  user
GET  /trips?from=&to=&date=                          ->  Trip[]
GET  /trips/popular-routes                           ->  [{ from, to, durationMinutes, fromPrice }]
GET  /admin/dashboard                                ->  số liệu thống kê (xem services/adminService.js)
```
Cấu trúc `Trip` ghi trong `services/tripService.js`. Mã thành phố (`TPHCM`, `DaNang`...) cấu hình ở `utils/cities.js`.
