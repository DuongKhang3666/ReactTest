# Frontend – VéXeOnline (React + Vite + TanStack Query)

## Chạy
```bash
cp .env.example .env     # lần đầu
npm install
npm run dev              # http://localhost:5173
npm run lint && npm run build
```

`VITE_USE_MOCK=true` (mặc định) → chạy hoàn toàn bằng mock data, **không cần backend**.  
Khi backend sẵn sàng: đặt `VITE_USE_MOCK=false` và `VITE_API_BASE_URL=http://localhost:8080/api`.

Tài khoản mock: khách `a@example.com / 123456`, admin `admin@example.com / admin123`.

## Phần FE1 đã hoàn thành
| Hạng mục | File chính |
|---|---|
| Login / Register / Logout | `pages/auth/*`, `contexts/AuthContext.jsx`, `services/authService.js` |
| ProtectedRoute / AdminRoute / GuestRoute | `routes/*` |
| Layout (Main + Admin) | `layouts/*`, `components/layout/*` |
| Home | `pages/customer/Home.jsx` |
| Search + Filter/Sort | `pages/customer/SearchTrips.jsx` |
| Profile | `pages/customer/Profile.jsx` |
| Admin Dashboard | `pages/admin/Dashboard.jsx` |
| Query/service | `queries/{queryClient,tripQueries,adminQueries,authQueries}.js`, `services/*` |

## TanStack Query trong FE1
- `useQuery` + `queryOptions`: tìm chuyến `["trips", from, to, date]`, tuyến phổ biến, dashboard `["admin","dashboard"]`, người dùng hiện tại `["users","me"]`.
- `useMutation`: login, register, cập nhật profile (`setQueryData(["users","me"])` sau khi thành công).
- Server state: dữ liệu chuyến/dashboard/user. Client/UI state (`useState`): form input, bộ lọc, sắp xếp, menu mobile.
- Mọi danh sách đều có loading / error (nút Thử lại) / empty state.
- 401 → `apiClient` phát sự kiện `auth:expired` → AuthContext đăng xuất và xóa cache.

## Dùng chung cho FE2/FE3
- `services/apiClient.js` tự gắn `Authorization: Bearer <token>`.
- `useAuth()` → `{ user, isAuthenticated, isAdmin, login, register, logout }`.
- `tripQueries.js` đã có `tripDetailQuery(id)` và `tripKeys` cho FE2.
- `AppRoutes.jsx`: các route của FE2/FE3 đang là `PlaceholderPage` – chỉ cần thay `element`, giữ nguyên `path`.
- `components/common`: `Spinner`, `ErrorState`, `EmptyState`, `Alert`, `TripCard`, `SearchForm`.
- `utils/format.js`: `formatPrice`, `formatDateTime`, `getErrorMessage`, ...

## Đề xuất API contract cho Backend (FE1 đang dùng)
```
POST /auth/register {username,email,password}  -> {token, user}
POST /auth/login    {email,password}           -> {token, user}
GET  /users/me                                 -> user
PUT  /users/me      {fullName, phone}          -> user            (mới)
GET  /trips?from=&to=&date=                    -> Trip[]
GET  /trips/popular-routes                     -> [{from,to,fromLabel,toLabel,durationMinutes,fromPrice}]  (mới)
GET  /admin/dashboard                          -> thống kê (xem services/adminService.js)  (mới)
```
`Trip = { id, departureTime, arrivalTime, price, status, availableSeats, route{...}, bus{...} }` – chi tiết trong `services/tripService.js`.  
Giá trị `from`/`to` (TPHCM, DaNang...) được cấu hình tại `utils/cities.js`.
