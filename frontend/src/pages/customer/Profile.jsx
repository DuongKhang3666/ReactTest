import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import Spinner from "../../components/common/Spinner";
import { getMe } from "../../services/authService";

export default function Profile() {
  const { user: savedUser, updateUser } = useAuth();

  // Lấy thông tin mới nhất từ backend (GET /users/me), rồi cập nhật lại user đang lưu trên giao diện
  const { data, isPending } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const me = await getMe();
      updateUser(me);
      return me;
    },
  });

  const user = data ?? savedUser;

  return (
    <div className="container">
      <div className="card narrow">
        <h1>Hồ sơ của tôi</h1>
        {isPending && <Spinner />}
        <p>
          <strong>Tên đăng nhập:</strong> {user.username}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Vai trò:</strong>{" "}
          <span className="badge">
            {user.role === "ADMIN" ? "Quản trị viên" : "Khách hàng"}
          </span>
        </p>
        <p>
          <strong>Họ và tên:</strong> {user.fullName || "Chưa cập nhật"}
        </p>
        <p>
          <strong>Số điện thoại:</strong> {user.phone || "Chưa cập nhật"}
        </p>
        <p className="muted">
          Chỉnh sửa hồ sơ sẽ có khi backend bổ sung API cập nhật (PUT
          /users/me).
        </p>
      </div>
    </div>
  );
}
