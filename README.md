# Website đặt và quản lý vé xe đường dài

> **Đồ án môn Các công nghệ lập trình hiện đại**
>
> Frontend là trọng tâm: **React + Vite + TanStack Query**.  
> Backend: **Spring Boot + MySQL** để cung cấp REST API và có thể tái sử dụng cho môn học khác.

---

## 1. Tổng quan đồ án

### 1.1. Mục tiêu

Xây dựng website cho phép khách hàng tìm chuyến xe đường dài, xem chuyến, chọn ghế và đặt vé; đồng thời cung cấp khu vực quản trị để quản lý xe, tuyến, chuyến và vé.

Điểm nhấn của đồ án là cách sử dụng các công nghệ frontend hiện đại:

- **React**: xây dựng giao diện, component, state và routing.
- **Vite**: khởi tạo, chạy development server và build frontend.
- **TanStack Query**: quản lý server state, fetching, caching, mutation, invalidation, loading/error state.

Backend chỉ cung cấp API và xử lý nghiệp vụ.

### 1.2. Kiến trúc tổng thể

```text
┌─────────────────────────────────────────┐
│               FRONTEND                  │
│             React + Vite                │
│                                         │
│ React Router                            │
│ TanStack Query                          │
│ Axios / Fetch                            │
│ CSS / UI                                │
└────────────────────┬────────────────────┘
                     │ HTTP / REST / JSON
                     ▼
┌─────────────────────────────────────────┐
│                BACKEND                  │
│              Spring Boot                │
│                                         │
│ Controller                              │
│ Service                                 │
│ Spring Security / JWT                   │
│ Spring Data JPA                         │
└────────────────────┬────────────────────┘
                     │ JDBC
                     ▼
┌─────────────────────────────────────────┐
│                  MySQL                  │
└─────────────────────────────────────────┘
```

### 1.3. Luồng nghiệp vụ chính

```text
Customer
   │
   ├── Đăng ký
   ├── Đăng nhập
   │
   ├── Nhập điểm đi + điểm đến + ngày
   │          ↓
   │      Tìm chuyến
   │          ↓
   │      Chọn chuyến
   │          ↓
   │      Xem sơ đồ ghế
   │          ↓
   │      Chọn ghế
   │          ↓
   │      Nhập thông tin hành khách
   │          ↓
   │      Đặt vé
   │          ↓
   │      Vé của tôi
   │          ↓
   │      Hủy vé (nếu hợp lệ)
   │
   └── Hồ sơ
```

Admin:

```text
Admin
  │
  ├── Dashboard
  ├── Quản lý xe
  ├── Quản lý tuyến
  ├── Quản lý chuyến
  ├── Quản lý vé
  └── Quản lý người dùng
```

---

# 2. Phạm vi MVP(tính năng cốt lõi)

## 2.1. Customer

- Đăng ký / đăng nhập / đăng xuất
- Tìm chuyến theo điểm đi, điểm đến, ngày
- Lọc / sắp xếp chuyến
- Xem chi tiết chuyến
- Xem sơ đồ ghế
- Chọn ghế
- Đặt vé
- Xem vé của tôi
- Xem chi tiết vé
- Hủy vé
- Xem hồ sơ

## 2.2. Admin

- Dashboard cơ bản
- CRUD xe
- CRUD tuyến
- CRUD chuyến
- Xem / quản lý vé
- Xem / quản lý người dùng ở mức cần thiết

## 2.3. Không làm trong MVP 4 tuần

Để bảo đảm hoàn thành đúng hạn, không mở rộng sang:

- Thanh toán online thật
- GPS realtime
- AI / chatbot
- SMS / email nâng cao
- Coupon / khuyến mãi
- Đánh giá nhà xe
- App mobile
- Chat realtime

Nếu các chức năng MVP chưa ổn định thì không thêm chức năng mới.

---

# 3. Công nghệ

## 3.1. Frontend

| Công nghệ | Vai trò |
|---|---|
| React | UI và component |
| Vite | Development server + build |
| TanStack Query | Server state, cache, query, mutation |
| React Router | Điều hướng |
| Axios | HTTP client |
| ESLint | Kiểm tra code |
| CSS / Tailwind | Giao diện, tùy nhóm |

### Quyết định của nhóm

**Chọn ESLint**, không dùng Oxlint làm linter chính cho đồ án.

Lý do: ESLint có hệ sinh thái React phổ biến, dễ tìm tài liệu, dễ thống nhất rule giữa 3 người frontend.

## 3.2. Backend

| Công nghệ | Vai trò |
|---|---|
| Java | Ngôn ngữ |
| Spring Boot | REST API |
| Spring Web | Controller / HTTP |
| Spring Data JPA | ORM / Repository |
| Spring Security | Authentication / Authorization |
| JWT | Authentication token |
| Validation | Kiểm tra dữ liệu request |
| MySQL | Database |

## 3.3. Công cụ nhóm

- Git
- GitHub
- GitHub Desktop hoặc Git CLI
- Postman
- VS Code
- IntelliJ IDEA / VS Code / IDE Java tùy thành viên

---

# 4. Cấu trúc repository

Repository gốc:

```text
Book-bus-tickets/
│
├── frontend/
│
├── backend/
│
├── database/
│   ├── schema.sql
│   └── seed.sql
│
├── docs/
│   ├── ERD.png
│   ├── API.md
│   └── architecture.png
│
├── .gitignore
└── README.md
```

## 4.1. Cấu trúc frontend

Sau khi setup React + Vite, hướng tới:

```text
frontend/
├── public/
│
├── src/
│   ├── assets/
│   │
│   ├── components/
│   │   ├── common/
│   │   ├── layout/
│   │   └── booking/
│   │
│   ├── layouts/
│   │   ├── MainLayout.jsx
│   │   └── AdminLayout.jsx
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   │
│   │   ├── customer/
│   │   │   ├── Home.jsx
│   │   │   ├── SearchTrips.jsx
│   │   │   ├── TripDetail.jsx
│   │   │   ├── Booking.jsx
│   │   │   ├── MyBookings.jsx
│   │   │   └── Profile.jsx
│   │   │
│   │   └── admin/
│   │       ├── Dashboard.jsx
│   │       ├── Buses.jsx
│   │       ├── Routes.jsx
│   │       ├── Trips.jsx
│   │       ├── Bookings.jsx
│   │       └── Users.jsx
│   │
│   ├── routes/
│   │   └── AppRoutes.jsx
│   │
│   ├── services/
│   │   ├── apiClient.js
│   │   ├── authService.js
│   │   ├── tripService.js
│   │   ├── bookingService.js
│   │   └── adminService.js
│   │
│   ├── queries/
│   │   ├── queryClient.js
│   │   ├── tripQueries.js
│   │   ├── bookingQueries.js
│   │   └── adminQueries.js
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── ...
│   │
│   ├── contexts/
│   │   └── AuthContext.jsx
│   │
│   ├── utils/
│   │   └── ...
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── .env
├── .env.example
├── eslint.config.js
├── package.json
└── vite.config.js
```

Không cần tạo toàn bộ file ngay lập tức. Chỉ tạo folder/file khi task tương ứng bắt đầu.

## 4.2. Chia frontend cho 3 người

### FE1

```text
pages/auth/
pages/customer/Home.jsx
pages/customer/SearchTrips.jsx

components/common/
layouts/
routes/
contexts/
```

Chịu trách nhiệm:

- Authentication
- Layout
- Home
- Search
- Query foundation

### FE2

```text
pages/customer/TripDetail.jsx
pages/customer/Booking.jsx

components/booking/
queries/tripQueries.js
queries/bookingQueries.js
```

Chịu trách nhiệm:

- Trip detail
- Seat map
- Chọn ghế
- Booking
- Mutation / invalidation

### FE3

```text
pages/customer/MyBookings.jsx
pages/customer/Profile.jsx

pages/admin/
queries/adminQueries.js
```

Chịu trách nhiệm:

- Vé của tôi
- Profile
- Dashboard
- Admin CRUD

Các thư mục `components`, `services`, `queries`, `hooks` là code dùng chung. Thay đổi cấu trúc chung phải được nhóm thống nhất.

---

# 5. Yêu cầu môi trường

Khuyến nghị:

- Node.js LTS
- npm đi kèm Node.js
- JDK 17+ hoặc JDK mà nhóm thống nhất
- MySQL 8.x
- Git
- Postman

Kiểm tra:

```bash
node -v
npm -v
java -version
git --version
```

Kiểm tra Maven nếu cài Maven:

```bash
mvn -version
```

> Với backend Spring Boot, ưu tiên dùng Maven Wrapper (`mvnw` / `mvnw.cmd`) được tạo cùng project để mọi thành viên không phải cài cùng một phiên bản Maven.

---

# 6. SETUP FRONTEND TỪ ĐẦU

Phần này dành cho thành viên clone repository lần đầu hoặc người phụ trách FE1 khi dựng project.

## 6.1. Clone repository

Ví dụ:

```bash
git clone <URL_GITHUB_CUA_NHOM>
cd Book-bus-tickets
```

Nếu repository đã có sẵn:

```text
Book-bus-tickets/
```

thì không tạo repository lồng bên trong `frontend`.

---

## 6.2. Tạo React project bằng Vite

Tại thư mục gốc:

```bash
npm create vite@latest frontend
```

Khi Vite hỏi:

```text
Framework: React
Variant: JavaScript
```

Nếu Vite có hỏi về linter, chọn:

```text
ESLint
```

Không cần thêm các công nghệ phụ chưa thống nhất với nhóm.

Sau đó:

```bash
cd frontend
npm install
```

---

## 6.3. Cài thư viện frontend

Cài React Router:

```bash
npm install react-router-dom
```

Cài TanStack Query:

```bash
npm install @tanstack/react-query
```

Cài TanStack Query Devtools để phát triển/debug:

```bash
npm install @tanstack/react-query-devtools
```

Cài Axios:

```bash
npm install axios
```

ESLint đã có trong template nếu lúc tạo Vite bạn chọn ESLint.

Kiểm tra:

```bash
npm run lint
```

---

## 6.4. Chạy thử frontend

Trong thư mục `frontend`:

```bash
npm run dev
```

Mở:

```text
http://localhost:5173
```

Nếu thấy trang React/Vite là setup cơ bản thành công.

---

# 7. SETUP TANSTACK QUERY

Đây là phần bắt buộc vì TanStack Query là một trong ba công nghệ trọng tâm của môn học.

## 7.1. Tạo Query Client

Tạo:

```text
frontend/src/queries/queryClient.js
```

```javascript
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

## 7.2. Cấu hình QueryClientProvider

`frontend/src/main.jsx`:

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";

import App from "./App";
import { queryClient } from "./queries/queryClient";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
```

Sau bước này, toàn bộ component con có thể sử dụng:

```text
useQuery()
useMutation()
useQueryClient()
```

---

# 8. SETUP REACT ROUTER

Tạo:

```text
frontend/src/routes/AppRoutes.jsx
```

Ví dụ ban đầu:

```jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>Home</div>} />
        <Route path="/login" element={<div>Login</div>} />
        <Route path="/register" element={<div>Register</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
```

Sau khi làm đầy đủ, route dự kiến:

```text
/
├── /login
├── /register
├── /trips
├── /trips/:id
├── /bookings
├── /bookings/:id
├── /profile
│
└── /admin
    ├── /dashboard
    ├── /buses
    ├── /routes
    ├── /trips
    ├── /bookings
    └── /users
```

---

# 9. SETUP API CLIENT

Tạo:

```text
frontend/src/services/apiClient.js
```

```javascript
import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
```

Mục tiêu:

```text
React
  ↓
apiClient
  ↓
http://localhost:8080/api
  ↓
Spring Boot
```

---

# 10. BIẾN MÔI TRƯỜNG FRONTEND

Tạo:

```text
frontend/.env
```

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

Tạo file mẫu để commit:

```text
frontend/.env.example
```

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

`.env` không commit lên Git.

`.env.example` được commit.

Sau khi thay `.env`, cần restart Vite:

```bash
npm run dev
```

---

# 11. TEST TANSTACK QUERY TRƯỚC KHI CÓ BACKEND

Để frontend không phải chờ backend, tuần 1 có thể kiểm tra TanStack Query bằng mock data:

```jsx
import { useQuery } from "@tanstack/react-query";

function TestQuery() {
  const { data, isPending } = useQuery({
    queryKey: ["test"],
    queryFn: async () => {
      return "TanStack Query is working!";
    },
  });

  if (isPending) {
    return <p>Loading...</p>;
  }

  return <p>{data}</p>;
}

export default TestQuery;
```

Nếu hiển thị:

```text
TanStack Query is working!
```

thì QueryClientProvider đang hoạt động.

Sau này chỉ cần thay `queryFn` bằng API thật.

---

# 12. QUY ƯỚC TANSTACK QUERY

Không viết `useQuery()` tùy ý ở tất cả page nếu query có thể tái sử dụng.

Nên tách các query quan trọng:

```text
src/queries/
├── queryClient.js
├── tripQueries.js
├── bookingQueries.js
└── adminQueries.js
```

Query key thống nhất:

```text
["trips", from, to, date]
["trip", tripId]
["seats", tripId]
["bookings", "me"]
["admin", "buses"]
["admin", "routes"]
["admin", "trips"]
```

### Quy tắc

- `useQuery`: lấy dữ liệu từ server.
- `useMutation`: thay đổi dữ liệu server.
- Sau mutation phải xem query nào đã trở nên cũ và invalidate đúng query.
- Phải có loading/error/empty state.

Ví dụ:

```text
Đặt vé
  ↓
useMutation()
  ↓
POST /api/bookings
  ↓
Thành công
  ↓
invalidate ["seats", tripId]
invalidate ["bookings", "me"]
```

---

# 13. SERVER STATE VÀ CLIENT STATE

Đây là điểm cần thống nhất khi trình bày TanStack Query.

## Server state

Dùng TanStack Query:

```text
Trips
Seats
Bookings
Buses
Routes
Users
```

## Client/UI state

Dùng React state:

```text
selectedSeat
isModalOpen
search input
selectedTab
form UI state
```

Ví dụ:

```jsx
const [selectedSeat, setSelectedSeat] = useState(null);
```

Không cần đưa `selectedSeat` thành một query của TanStack Query.

---

# 14. SETUP BACKEND SPRING BOOT TỪ ĐẦU

Backend có thể được tạo bằng Spring Initializr.

Các dependency chính:

```text
Spring Web
Spring Data JPA
MySQL Driver
Spring Security
Validation
Lombok (tùy nhóm)
```

JWT cần thêm thư viện JWT mà nhóm đã thống nhất trong backend. Không commit secret JWT thật.

Project backend nên có dạng:

```text
backend/
├── src/
│   ├── main/
│   │   ├── java/...
│   │   └── resources/
│   │       ├── application.properties
│   │       └── ...
│   └── test/
├── mvnw
├── mvnw.cmd
└── pom.xml
```

---

# 15. CẤU TRÚC BACKEND ĐỀ XUẤT

```text
backend/src/main/java/.../
├── config/
├── controller/
├── dto/
├── entity/
├── exception/
├── repository/
├── security/
└── service/
```

Vai trò:

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
MySQL
```

Không truy cập database trực tiếp từ Controller.

---

# 16. SETUP MYSQL

Tạo database:

```sql
CREATE DATABASE bus_ticket_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

Kiểm tra:

```sql
SHOW DATABASES;
```

Phải thấy:

```text
bus_ticket_db
```

---

# 17. CẤU HÌNH DATABASE CHO BACKEND

Trong development, có thể dùng profile local.

Tạo:

```text
backend/src/main/resources/application.properties
```

Ví dụ:

```properties
spring.application.name=bus-ticket-api
server.port=8080

spring.jpa.hibernate.ddl-auto=update
spring.jpa.open-in-view=false
spring.jpa.show-sql=false

spring.profiles.active=local
```

Tạo file local riêng:

```text
backend/src/main/resources/application-local.properties
```

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/bus_ticket_db
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

File `application-local.properties` không commit nếu có thông tin riêng của máy.

Có thể tạo file mẫu:

```text
backend/src/main/resources/application-local.example.properties
```

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/bus_ticket_db
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

> Nhóm có thể thay cách quản lý secret bằng biến môi trường; điều quan trọng là không commit password database hoặc JWT secret thật.

---

# 18. CHẠY BACKEND

Windows:

```bash
cd backend
mvnw.cmd spring-boot:run
```

macOS/Linux:

```bash
cd backend
./mvnw spring-boot:run
```

Nếu máy đã cài Maven:

```bash
mvn spring-boot:run
```

Backend:

```text
http://localhost:8080
```

Kiểm tra một endpoint đơn giản, ví dụ:

```text
GET http://localhost:8080/api/trips
```

---

# 19. CORS — FRONTEND VÀ BACKEND CHẠY KHÁC PORT

Development:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:8080
```

Do khác origin, backend phải cho phép frontend gọi API.

Khi dùng Spring Security, CORS phải được cấu hình trong Security configuration, không chỉ ở Controller.

Cấu hình cần cho phép:

```text
Origin:
http://localhost:5173
```

Method tối thiểu:

```text
GET
POST
PUT
PATCH
DELETE
OPTIONS
```

Headers:

```text
Authorization
Content-Type
```

Không dùng `*` cho production.

---

# 20. DATABASE MVP

Các bảng chính:

```text
users
buses
routes
trips
seats
bookings
tickets
```

Quan hệ:

```text
User -> Booking -> Ticket -> Seat
Route -> Trip -> Bus
```

### Lưu ý nghiệp vụ quan trọng

```text
Seat thuộc Bus.
```

Không tạo một bản ghi Seat mới cho mỗi Trip.

Ví dụ:

```text
Bus A
├── A01
├── A02
├── A03
└── A04
```

Nếu Bus A chạy Trip 100:

```text
Trip 100
Bus A
```

thì trạng thái ghế của Trip 100 được xác định dựa trên các Ticket/Booking của Trip 100.

---

# 21. DATABASE SCRIPT

`database/schema.sql` dùng để ghi nhận cấu trúc database hoặc dựng database thủ công khi nhóm cần.

`database/seed.sql` dùng để tạo dữ liệu demo.

Trong development, nếu dùng:

```properties
spring.jpa.hibernate.ddl-auto=update
```

thì JPA có thể tự tạo/cập nhật bảng theo entity.

Không nên vừa để JPA tự quản lý schema vừa viết một bộ `schema.sql` cạnh tranh với JPA mà không có quy ước rõ ràng.

Khuyến nghị:

```text
Development:
JPA ddl-auto=update

Demo / reset:
schema.sql + seed.sql hoặc script reset riêng
```

---

# 22. API CHÍNH

## 22.1. Authentication

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/users/me
```

Ví dụ register:

```json
{
  "username": "nguyenvana",
  "email": "a@example.com",
  "password": "123456"
}
```

Ví dụ login:

```json
{
  "email": "a@example.com",
  "password": "123456"
}
```

Backend trả JWT theo contract mà nhóm thống nhất.

Frontend gửi token ở:

```http
Authorization: Bearer <token>
```

---

## 22.2. Trip

```text
GET /api/trips
GET /api/trips/{id}
```

Ví dụ:

```text
GET /api/trips?from=TPHCM&to=DaNang&date=2026-10-05
```

Frontend:

```text
queryKey:
["trips", from, to, date]
```

---

## 22.3. Seat

```text
GET /api/trips/{tripId}/seats
```

Frontend:

```text
queryKey:
["seats", tripId]
```

---

## 22.4. Booking

```text
POST  /api/bookings
GET   /api/bookings/my
GET   /api/bookings/{id}
PATCH /api/bookings/{id}/cancel
```

Đặt vé dùng:

```text
useMutation()
```

---

## 22.5. Admin

```text
GET    /api/admin/buses
POST   /api/admin/buses
PUT    /api/admin/buses/{id}
DELETE /api/admin/buses/{id}

GET    /api/admin/routes
POST   /api/admin/routes
PUT    /api/admin/routes/{id}
DELETE /api/admin/routes/{id}

GET    /api/admin/trips
POST   /api/admin/trips
PUT    /api/admin/trips/{id}
DELETE /api/admin/trips/{id}

GET    /api/admin/bookings
GET    /api/admin/users
```

---

# 23. QUY TẮC BOOKING

Backend phải kiểm tra:

```text
1. User có tồn tại không?
2. Trip có tồn tại không?
3. Seat có thuộc Bus của Trip không?
4. Seat đã có Ticket active trong Trip đó chưa?
5. Nếu chưa:
   -> tạo Booking
   -> tạo Ticket
6. Nếu rồi:
   -> trả lỗi
```

Frontend không được tự quyết định rằng ghế còn trống là chắc chắn có thể đặt.

Frontend chỉ hiển thị trạng thái.

Backend mới là nơi đảm bảo tính đúng đắn.

---

# 24. HTTP STATUS ĐỀ XUẤT

```text
200 OK
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity
500 Internal Server Error
```

Ví dụ ghế vừa bị người khác đặt:

```text
POST /api/bookings
↓
409 Conflict
```

Frontend:

```text
"Ghế này vừa được người khác đặt. Vui lòng chọn ghế khác."
```

Sau đó refetch:

```text
["seats", tripId]
```

---

# 25. CHẠY CẢ FRONTEND VÀ BACKEND

Cần mở 2 terminal.

## Terminal 1

```bash
cd Book-bus-tickets/frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## Terminal 2

```bash
cd Book-bus-tickets/backend
mvnw.cmd spring-boot:run
```

Backend:

```text
http://localhost:8080
```

## Kiểm tra kết nối

```text
React
  ↓
GET /api/trips
  ↓
Spring Boot
  ↓
JPA
  ↓
MySQL
  ↓
JSON
  ↓
TanStack Query
  ↓
React UI
```

---

# 26. GIT WORKFLOW

Không push trực tiếp vào `main`.

Cấu trúc branch:

```text
main
  |
develop
  |
  ├── feature/fe-auth
  ├── feature/fe-search
  ├── feature/fe-booking
  ├── feature/fe-admin
  ├── feature/be-auth
  ├── feature/be-trip
  └── feature/be-booking
```

Quy trình:

```text
Tạo branch
    ↓
Code
    ↓
Test
    ↓
Commit
    ↓
Push
    ↓
Pull Request
    ↓
Review
    ↓
Merge vào develop
    ↓
Integration test
    ↓
Merge main
```

---

# 27. `.gitignore`

Repository có cả Node.js và Java nên cần ignore cả hai.

`.gitignore` ở thư mục gốc:

```gitignore
# =========================
# Frontend - Node / Vite
# =========================
frontend/node_modules/
frontend/dist/
frontend/.vite/

# Environment
.env
*.env
!.env.example

# =========================
# Backend - Maven
# =========================
backend/target/

# Local Spring configuration
backend/src/main/resources/application-local.properties

# =========================
# IDE
# =========================
.idea/
.vscode/
*.iml

# =========================
# OS
# =========================
.DS_Store
Thumbs.db
```

Không commit:

```text
.env
application-local.properties
database password
JWT secret
```

---

# 28. CÁCH TẠO FRONTEND CHO NHÓM MỘT CÁCH THỐNG NHẤT

Thành viên FE1 có thể là người khởi tạo project:

```bash
cd Book-bus-tickets
npm create vite@latest frontend
cd frontend
npm install
npm install react-router-dom @tanstack/react-query @tanstack/react-query-devtools axios
npm run lint
npm run dev
```

Sau khi frontend chạy được:

```bash
cd ..
git add frontend
git commit -m "chore(frontend): initialize React Vite project"
git push
```

Các thành viên FE2/FE3 chỉ cần:

```bash
git pull
cd frontend
npm install
npm run dev
```

Không chạy lại:

```bash
npm create vite@latest frontend
```

trên project đã tồn tại.

---

# 29. TEST SAU KHI CLONE PROJECT

Một thành viên mới clone repository phải có thể làm:

```bash
git clone <repo>
cd Book-bus-tickets

cd frontend
npm install
npm run dev
```

Và terminal khác:

```bash
cd backend
mvnw.cmd spring-boot:run
```

Sau khi cấu hình database local, hệ thống phải chạy được.

Đây là một trong các tiêu chí **Definition of Done của dự án**.

---

# 30. Definition of Done

Một task chỉ được xem là hoàn thành khi:

1. Code build/run được.
2. Đúng API contract.
3. Có loading/error/empty state phù hợp.
4. Có test happy path.
5. Có test edge case chính.
6. Không có console error nghiêm trọng.
7. Pull Request đã được review.
8. Nếu liên quan TanStack Query: queryKey/queryFn/mutation/invalidation đúng quy ước.
9. Không phá chức năng của thành viên khác.

---

# 31. TIẾN ĐỘ 4 TUẦN

## TUẦN 1 — Phân tích, thiết kế và nền móng

### Mục tiêu cuối tuần

- Chốt phạm vi MVP.
- Chốt Customer/Admin.
- Hoàn thành Use Case.
- Hoàn thành ERD.
- Chốt API contract.
- Frontend chạy với Vite + React + TanStack Query.
- Backend chạy được.
- MySQL kết nối được.
- Frontend có mock UI để không phụ thuộc backend.

### Thứ 2

**Cả nhóm**
- Chốt tên đề tài.
- Chốt chức năng MVP.
- Chốt user role.
- Chốt luồng Customer/Admin.

**FE1**
- Tạo Vite + React.
- Chọn JavaScript.
- Chọn ESLint.
- Cài React Router, TanStack Query, Axios.
- Tạo cấu trúc thư mục.

**FE2**
- Wireframe Trip Detail.
- Wireframe Seat Map.
- Wireframe Booking.

**FE3**
- Wireframe Login/Register.
- Wireframe My Bookings.
- Wireframe Admin.

### Thứ 3

**Cả nhóm**
- ERD 7 bảng.

**BE1 + BE2**
- Spring Boot.
- MySQL.
- JPA.
- Validation.

**FE1**
- QueryClientProvider.
- React Router.
- Layout.

### Thứ 4

**Cả nhóm**
- API contract:
  - URL
  - HTTP method
  - request
  - response
  - status code
  - role

**BE1**
- User/Auth skeleton.

**BE2**
- Seat/Booking/Ticket model.

### Thứ 5

**FE1**
- Auth UI.
- Search mock.
- `useQuery` mock.

**FE2**
- Trip Detail.
- Seat Map mock.

**FE3**
- Booking History.
- Admin table mock.

### Thứ 6

**BE1**
- Bus/Route/Trip CRUD skeleton.

**BE2**
- Seat/Booking API skeleton.
- Seed data.

**Cả nhóm**
- Kiểm tra repository.

### M1 — Cuối tuần 1

Phải có:

```text
ERD ✅
API contract ✅
Frontend chạy ✅
Backend chạy ✅
MySQL kết nối ✅
Mock UI ✅
Git workflow ✅
```

---

## TUẦN 2 — Luồng nghiệp vụ cốt lõi

### Mục tiêu cuối tuần

Khách hàng có thể chạy:

```text
Register
   ↓
Login
   ↓
Search
   ↓
Trip Detail
   ↓
Select Seat
   ↓
Booking
   ↓
My Bookings
```

### Thứ 2

**FE1**
- Login/Register/Logout.
- ProtectedRoute.
- AdminRoute.

**FE2**
- Trip detail từ API thật.
- Seats từ API thật.

**FE3**
- My Bookings API.
- Booking detail.

### Thứ 3

**BE1**
- Auth/JWT.
- Bus/Route/Trip API.

**BE2**
- Seat API.
- Create booking API.

### Thứ 4

**FE1**
- Search API.
- Query key theo filter.

**FE2**
- `useMutation`.
- Booking.
- Invalidation.

**FE3**
- History/detail/cancel.

### Thứ 5

**BE1**
- Trip filter.
- Validation.

**BE2**
- Cancel booking.
- Chống đặt trùng ghế.

### Thứ 6

Cả nhóm chạy end-to-end.

### M2 — Cuối tuần 2

Nếu còn thiếu luồng booking, không thêm chức năng mới.

---

## TUẦN 3 — TanStack Query + Admin + Security

### Mục tiêu cuối tuần

- TanStack Query được dùng có hệ thống.
- Admin CRUD chính hoạt động.
- JWT + role hoạt động.
- Booking ổn định.
- Feature freeze.

### TanStack Query phải có

```text
useQuery
useMutation
queryKey
cache
staleTime
invalidateQueries
loading
error
empty state
```

### Admin

```text
Buses CRUD
Routes CRUD
Trips CRUD
Bookings
Users
Dashboard
```

### Backend

```text
JWT
Role authorization
Validation
Transaction
Duplicate seat handling
Exception handler
```

### M3 — Feature Freeze

Sau mốc này không mở chức năng lớn.

---

## TUẦN 4 — Integration + Test + Demo

### Mục tiêu

- Setup được từ README trên máy sạch.
- Không còn lỗi chức năng nghiêm trọng.
- Responsive.
- Tài liệu hoàn chỉnh.
- Demo hoàn chỉnh.

### Thứ 2

Fresh setup từ GitHub.

Test:

```text
Auth
Search
Trip
Seat
Booking
Admin
```

### Thứ 3

Edge cases:

```text
Không có chuyến
Hết ghế
Ghế vừa bị đặt
Token hết hạn
Không có quyền
Request sai
```

### Thứ 4

Frontend:

- Responsive.
- UI polish.
- Console sạch.

Backend:

- Seed/reset database.
- API ổn định.

### Thứ 5

- README.
- Báo cáo.
- Slide.
- Architecture.
- ERD.
- API document.
- Demo rehearsal.

### Thứ 6

- Fix lỗi cuối.
- Tag release.
- Kiểm tra repository.

### M4 — Release

```text
Source ✅
README ✅
Database ✅
Backend ✅
Frontend ✅
Demo ✅
Report ✅
Slides ✅
```

---

# 32. KỊCH BẢN DEMO

## Customer

1. Đăng ký.
2. Đăng nhập.
3. Tìm TP.HCM → Đà Nẵng.
4. Lọc/sắp xếp.
5. Xem chi tiết.
6. Chọn ghế.
7. Đặt vé.
8. Xem Vé của tôi.
9. Hủy vé.
10. Cho thấy ghế/vé được cập nhật sau mutation.

## Admin

1. Đăng nhập admin.
2. Mở dashboard.
3. CRUD xe.
4. CRUD tuyến.
5. CRUD chuyến.
6. Xem booking/vé.
7. Minh họa role authorization.

## Điểm trình bày TanStack Query

- `useQuery` cho search/detail/seats/bookings.
- Query key theo tham số.
- Cache.
- `staleTime`.
- `useMutation`.
- `invalidateQueries`.
- Loading/error/empty state.

---

# 33. Checklist trước khi nộp

## Frontend

- [ ] `npm install` thành công.
- [ ] `npm run dev` chạy.
- [ ] `npm run lint` chạy.
- [ ] `npm run build` chạy.
- [ ] React Router hoạt động.
- [ ] TanStack Query hoạt động.
- [ ] Search hoạt động.
- [ ] Seat hoạt động.
- [ ] Booking hoạt động.
- [ ] Admin hoạt động.
- [ ] Responsive.

## Backend

- [ ] Spring Boot chạy.
- [ ] MySQL kết nối.
- [ ] Auth hoạt động.
- [ ] JWT hoạt động.
- [ ] Role hoạt động.
- [ ] Trip API hoạt động.
- [ ] Seat API hoạt động.
- [ ] Booking API hoạt động.
- [ ] Không đặt trùng ghế.
- [ ] CORS hoạt động.

## Repository

- [ ] Không commit `.env`.
- [ ] Không commit password.
- [ ] Không commit JWT secret.
- [ ] Không commit `node_modules`.
- [ ] Không commit `target`.
- [ ] README đủ để thành viên mới setup.
- [ ] Có ERD.
- [ ] Có API document.
- [ ] Có seed/demo data.

---

# 34. Tài liệu liên quan

File phân chia công việc chi tiết 4 tuần:

```text
PHAN_CHIA_CONG_VIEC_WEBSITE_DAT_VE_XE_CHI_TIET_4_TUAN.docx
```

README này là tài liệu hướng dẫn tổng thể của repository.
