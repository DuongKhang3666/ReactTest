import apiClient, { USE_MOCK, USER_KEY } from "./apiClient";
import { MOCK_USERS } from "./mockData";

/*
 * API THẬT của backend (nhánh main):
 *   POST /auth/register  { username, email, password }  ->  201 { token: null, id, username, email, fullName, phone, role }
 *   POST /auth/login     { email, password }            ->  200 { token, id, username, email, fullName, phone, role }
 *   GET  /users/me                                      ->  { id, username, email, fullName, phone, role }
 * Backend CHƯA có PUT /users/me nên chưa sửa được hồ sơ (xem PROFILE_EDITABLE).
 * Ở đây ta chuyển về dạng { token, user } cho phần còn lại của giao diện dùng.
 */

// Có sửa được hồ sơ không? Chỉ khi chạy mock (backend chưa có API cập nhật hồ sơ).
export const PROFILE_EDITABLE = USE_MOCK;

// { token, id, username, ... } -> { token, user: { id, username, ... } }
function toSession({ token, ...user }) {
  return { token, user };
}

// ----- Phần giả lập: lưu danh sách user vào localStorage để đăng ký/đăng nhập thử được -----
const wait = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

function loadUsers() {
  const saved = localStorage.getItem("mock_users");
  return saved ? JSON.parse(saved) : MOCK_USERS;
}

function saveUsers(users) {
  localStorage.setItem("mock_users", JSON.stringify(users));
}

function withoutPassword(user) {
  const { password, ...publicUser } = user;
  void password;
  return publicUser;
}

// ----- Các hàm dùng trong app -----
export async function login({ email, password }) {
  if (!USE_MOCK) {
    const response = await apiClient.post("/auth/login", { email, password });
    return toSession(response.data);
  }

  await wait();
  const user = loadUsers().find((u) => u.email === email && u.password === password);
  if (!user) throw new Error("Email hoặc mật khẩu không đúng.");
  return { token: `mock-token-${user.id}`, user: withoutPassword(user) };
}

export async function register({ username, email, password }) {
  if (!USE_MOCK) {
    // Backend đăng ký xong KHÔNG trả token -> đăng nhập luôn để lấy token
    await apiClient.post("/auth/register", { username, email, password });
    return login({ email, password });
  }

  await wait();
  const users = loadUsers();
  if (users.some((u) => u.email === email)) throw new Error("Email đã được sử dụng.");
  if (users.some((u) => u.username === username)) throw new Error("Tên đăng nhập đã tồn tại.");

  const newUser = { id: users.length + 1, username, email, password, role: "CUSTOMER", fullName: "", phone: "" };
  saveUsers([...users, newUser]);
  return { token: `mock-token-${newUser.id}`, user: withoutPassword(newUser) };
}

export async function updateMe({ fullName, phone }) {
  if (!USE_MOCK) {
    throw new Error("Backend chưa hỗ trợ cập nhật hồ sơ (chưa có API PUT /users/me).");
  }

  await wait();
  const currentUser = JSON.parse(localStorage.getItem(USER_KEY));
  const users = loadUsers().map((u) => (u.id === currentUser.id ? { ...u, fullName, phone } : u));
  saveUsers(users);
  return withoutPassword(users.find((u) => u.id === currentUser.id));
}
