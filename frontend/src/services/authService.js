import apiClient, { USE_MOCK, TOKEN_KEY, AUTH_EXPIRED_EVENT } from "./apiClient";
import { MockError, loadUsers, saveUsers, mockDelay, toPublicUser } from "./mock/mockDb";

/*
 * Contract (FE1 đề xuất - BE1 xác nhận):
 *  POST /auth/register  { username, email, password }      -> { token, user }
 *  POST /auth/login     { email, password }                -> { token, user }
 *  GET  /users/me                                          -> user
 *  PUT  /users/me       { fullName, phone }                -> user
 *  user = { id, username, email, role: "CUSTOMER"|"ADMIN", fullName, phone }
 */

export async function login({ email, password }) {
  if (!USE_MOCK) return (await apiClient.post("/auth/login", { email, password })).data;
  await mockDelay();
  const user = loadUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.password !== password) throw new MockError(401, "Email hoặc mật khẩu không đúng.");
  return { token: `mock-token-${user.id}`, user: toPublicUser(user) };
}

export async function register({ username, email, password }) {
  if (!USE_MOCK) return (await apiClient.post("/auth/register", { username, email, password })).data;
  await mockDelay();
  const users = loadUsers();
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) throw new MockError(409, "Email đã được sử dụng.");
  if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) throw new MockError(409, "Tên đăng nhập đã tồn tại.");
  const user = { id: Math.max(...users.map((u) => u.id)) + 1, username, email, password, role: "CUSTOMER", fullName: "", phone: "" };
  saveUsers([...users, user]);
  return { token: `mock-token-${user.id}`, user: toPublicUser(user) };
}

const mockCurrentUser = () => {
  const token = localStorage.getItem(TOKEN_KEY) ?? "";
  const id = Number(token.replace("mock-token-", ""));
  const user = loadUsers().find((u) => u.id === id);
  if (!user) {
    window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT)); // giống interceptor 401 của bản thật
    throw new MockError(401, "Phiên đăng nhập không hợp lệ.");
  }
  return user;
};

export async function getMe() {
  if (!USE_MOCK) return (await apiClient.get("/users/me")).data;
  await mockDelay(150);
  return toPublicUser(mockCurrentUser());
}

export async function updateMe({ fullName, phone }) {
  if (!USE_MOCK) return (await apiClient.put("/users/me", { fullName, phone })).data;
  await mockDelay();
  const me = mockCurrentUser();
  const users = loadUsers().map((u) => (u.id === me.id ? { ...u, fullName, phone } : u));
  saveUsers(users);
  return toPublicUser(users.find((u) => u.id === me.id));
}
