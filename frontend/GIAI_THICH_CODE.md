# Giải thích code FE1 (để bảo vệ đồ án)

## 1. Cấu trúc thư mục `src/`
```
pages/        Mỗi trang một file (Login, Home, SearchTrips, Profile, Dashboard...)
components/   Thành phần giao diện dùng lại (TripCard, SearchForm, TripFilters, Icon...)
layouts/      Khung chung: MainLayout (khách) và AdminLayout (quản trị)
routes/       AppRoutes (danh sách đường dẫn), ProtectedRoute, AdminRoute
services/     Hàm gọi API (axios). Có nhánh dữ liệu giả khi chưa có backend
queries/      Hook useQuery lấy dữ liệu từ server
contexts/ + hooks/useAuth.js    Thông tin đăng nhập dùng chung
utils/        Hàm tiện ích: định dạng giá/ngày, lọc/sắp xếp chuyến
styles/       CSS của app, chia thành các file nhỏ (xem mục 7)
```

## 2. Luồng chạy chính
1. `main.jsx` render `App`. `App` bọc app bằng `QueryClientProvider` (TanStack Query) và `AuthProvider` (đăng nhập), rồi hiển thị `AppRoutes`.
2. **Đăng nhập**: `Login.jsx` kiểm tra form, gọi `login()` qua `useMutation`. Thành công thì `AuthProvider` lưu `token` và `user` vào `localStorage` và vào state, sau đó chuyển trang. F5 không mất đăng nhập vì đọc lại từ `localStorage`.
3. **Gọi API**: `apiClient.js` (axios) tự gắn `Authorization: Bearer <token>` vào mỗi request. Nếu server trả 401 thì xóa phiên và về `/login`.
4. **Tìm chuyến**: form đẩy `from, to, date` lên URL. `SearchTrips` đọc URL, gọi `useSearchTrips(from, to, date)` để lấy danh sách, rồi **lọc/sắp xếp ở phía giao diện** bằng `filterTrips` và `sortTrips`.
5. **Chặn trang**: `ProtectedRoute` kiểm tra đã đăng nhập chưa, `AdminRoute` kiểm tra thêm role `ADMIN`.

## 3. Hai loại state (câu hỏi hay gặp)
- **Server state** (dữ liệu nằm trên server: danh sách chuyến, dashboard) dùng **TanStack Query** (`useQuery`). Thư viện lo việc cache, trạng thái đang tải/lỗi, gọi lại khi cần.
- **Client state** (chỉ tồn tại trên giao diện: ô đang nhập, bộ lọc, kiểu sắp xếp, menu mobile) dùng **`useState`**.
- Thao tác **ghi dữ liệu** (đăng nhập, đăng ký, sửa hồ sơ) dùng **`useMutation`**.

## 4. Chế độ dữ liệu giả (mock)
Mỗi hàm trong `services/` có dạng: `if (!USE_MOCK) { gọi API thật } else { trả dữ liệu từ mockData.js }`.
Đổi `VITE_USE_MOCK` trong `.env` để chuyển qua lại, không cần sửa component.

## 5. Câu hỏi thường gặp
**Vì sao không lưu danh sách chuyến bằng useState + useEffect?**
useQuery tự xử lý loading/error/cache/gọi lại, ít code hơn và ít lỗi hơn.

**Vì sao lọc ở giao diện mà không gọi API?**
Dữ liệu đã tải về rồi, lọc ngay thì nhanh và không tốn request. Nếu danh sách rất lớn mới cần lọc ở backend.

**Lưu token ở localStorage có an toàn không?**
Dễ làm, nhưng có thể bị đánh cắp nếu trang bị lỗi XSS. Hướng an toàn hơn là cookie HttpOnly do backend đặt. Với đồ án, localStorage là chấp nhận được.

**Chặn trang bằng ProtectedRoute có đủ bảo mật không?**
Không. Đó chỉ để thân thiện với người dùng. Bảo mật thật phải do backend kiểm tra token và quyền ở mỗi API.

**Sau khi sửa hồ sơ, tên trên thanh menu đổi theo bằng cách nào?**
`Profile` gọi `updateUser(user mới)` của `AuthProvider`, state `user` đổi nên mọi component dùng `useAuth()` tự hiển thị lại.

**Vì sao dùng React Router lồng nhau (`<Outlet />`)?**
Để dùng chung layout (thanh menu, chân trang) và gom các trang cần bảo vệ dưới một `ProtectedRoute`.

## 6. Quy tắc giao diện
Không dùng emoji/icon Unicode. Icon là SVG inline trong `components/common/Icon.jsx`, dùng `<Icon name="bus" />`. Thêm icon mới: thêm một mục vào object `PATHS` của file này.

## 7. Cách tổ chức CSS
- `src/index.css`: reset cơ bản (box-sizing, margin, font...).
- `src/styles/`: style của app, mỗi file một nhóm, tổng khoảng 80 dòng:

| File | Nội dung |
|---|---|
| `variables.css` | Màu chủ đạo (đổi màu chỉ cần sửa ở đây) |
| `base.css` | Chữ, tiêu đề, icon, các class tiện ích (`.muted`, `.blue`, `.big`...) |
| `layout.css` | Bố cục chung: `.container`, `.row`, `.grid`, `.card` |
| `navbar.css` | Thanh menu, chân trang, link menu |
| `buttons.css` | Nút bấm |
| `forms.css` | Ô nhập, nhãn, checkbox, form tìm chuyến |
| `feedback.css` | Thông báo, trạng thái tải/lỗi/rỗng, nhãn trạng thái (badge) |
| `trips.css` | Trang chủ (hero), kết quả tìm chuyến, giá |
| `admin.css` | Layout và dashboard admin |

Tất cả được import trong `main.jsx` theo đúng thứ tự trên. **Không đổi thứ tự**, vì CSS phía sau có thể ghi đè phía trước.

Cách viết cho gọn:
- Style trực tiếp theo thẻ HTML (`header`, `footer`, `label`, `input`, `table`...) nên không cần đặt class cho từng thứ.
- Responsive không cần media query: `.row` dùng `flex-wrap`, `.grid` dùng `repeat(auto-fit, minmax(...))` nên tự xuống dòng khi màn hình hẹp.
- Thêm style cho một trang mới: tạo file mới trong `styles/` và import thêm một dòng trong `main.jsx`.
