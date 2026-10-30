import apiClient from "./apiClient";

/*
 * API của backend (Spring Boot):
 *   POST /auth/register  { username, email, password }  ->  201 { token: null, id, username, email, fullName, phone, role }
 *   POST /auth/login     { email, password }            ->  200 { token, id, username, email, fullName, phone, role }
 *   GET  /users/me                                      ->  { id, username, email, fullName, phone, role }
 * Phần còn lại của giao diện dùng dạng { token, user }, nên ở đây ta chuyển đổi lại.
 */

// { token, id, username, ... } -> { token, user: { id, username, ... } }
function toSession({ token, ...user }) {
  return { token, user };
}

export async function login({ email, password }) {
  const response = await apiClient.post("/auth/login", { email, password });
  return toSession(response.data);
}

export async function register({ username, email, password }) {
  // Backend đăng ký xong KHÔNG trả token -> đăng nhập luôn để lấy token
  await apiClient.post("/auth/register", { username, email, password });
  return login({ email, password });
}

// Lấy thông tin người dùng đang đăng nhập (dựa vào JWT)
export async function getMe() {
  const response = await apiClient.get("/users/me");
  return response.data;
}
