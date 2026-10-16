import apiClient, { USE_MOCK, USER_KEY } from "./apiClient";
import { MOCK_USERS } from "./mockData";

/*
 * API (đề xuất cho backend):
 *   POST /auth/register  { username, email, password }   ->  { token, user }
 *   POST /auth/login     { email, password }             ->  { token, user }
 *   PUT  /users/me       { fullName, phone }             ->  user
 * user = { id, username, email, role: "CUSTOMER" | "ADMIN", fullName, phone }
 */

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
    return response.data;
  }

  await wait();
  const user = loadUsers().find((u) => u.email === email && u.password === password);
  if (!user) throw new Error("Email hoặc mật khẩu không đúng.");
  return { token: `mock-token-${user.id}`, user: withoutPassword(user) };
}

export async function register({ username, email, password }) {
  if (!USE_MOCK) {
    const response = await apiClient.post("/auth/register", { username, email, password });
    return response.data;
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
    const response = await apiClient.put("/users/me", { fullName, phone });
    return response.data;
  }

  await wait();
  const currentUser = JSON.parse(localStorage.getItem(USER_KEY));
  const users = loadUsers().map((u) => (u.id === currentUser.id ? { ...u, fullName, phone } : u));
  saveUsers(users);
  return withoutPassword(users.find((u) => u.id === currentUser.id));
}
