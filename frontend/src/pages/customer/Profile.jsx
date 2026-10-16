import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import Alert from "../../components/common/Alert";
import { updateMe } from "../../services/authService";
import { getErrorMessage } from "../../utils/format";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [fullName, setFullName] = useState(user.fullName ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [phoneError, setPhoneError] = useState("");

  // Lưu hồ sơ là thao tác gửi dữ liệu -> useMutation. Thành công thì cập nhật user trên giao diện.
  const mutation = useMutation({ mutationFn: updateMe, onSuccess: updateUser });

  const handleSubmit = (e) => {
    e.preventDefault();

    const phoneOk = phone === "" || /^0\d{9}$/.test(phone);
    setPhoneError(phoneOk ? "" : "Số điện thoại gồm 10 chữ số, bắt đầu bằng 0.");
    if (phoneOk) mutation.mutate({ fullName: fullName.trim(), phone });
  };

  return (
    <div className="container">
      <div className="card narrow">
        <h1>Hồ sơ của tôi</h1>
        <p><strong>Tên đăng nhập:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Vai trò:</strong> <span className="badge">{user.role === "ADMIN" ? "Quản trị viên" : "Khách hàng"}</span></p>

        <form onSubmit={handleSubmit} noValidate>
          <h2>Thông tin cá nhân</h2>
          <Alert>{mutation.isError && getErrorMessage(mutation.error)}</Alert>
          <Alert type="success">{mutation.isSuccess && "Đã cập nhật hồ sơ."}</Alert>

          <label>
            Họ và tên
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nguyễn Văn A" />
          </label>

          <label>
            Số điện thoại
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0901234567" />
            {phoneError && <small className="error">{phoneError}</small>}
          </label>

          <button type="submit" className="btn" disabled={mutation.isPending}>
            {mutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </form>
      </div>
    </div>
  );
}
