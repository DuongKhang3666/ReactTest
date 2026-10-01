import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import Alert from "../../components/common/Alert";
import { authKeys } from "../../queries/authQueries";
import { updateMe } from "../../services/authService";
import { getErrorMessage } from "../../utils/format";

export default function Profile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ fullName: user.fullName ?? "", phone: user.phone ?? "" });
  const [errors, setErrors] = useState({});

  const mutation = useMutation({
    mutationFn: updateMe,
    // Cập nhật cache ["users","me"] -> Navbar/Profile tự hiển thị tên mới
    onSuccess: (updated) => queryClient.setQueryData(authKeys.me(), updated),
  });

  const setField = (name) => (e) => {
    mutation.reset();
    setForm((f) => ({ ...f, [name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (form.fullName.trim().length > 120) next.fullName = "Họ tên tối đa 120 ký tự.";
    if (form.phone && !/^(0|\+84)\d{9,10}$/.test(form.phone.replace(/\s/g, ""))) next.phone = "Số điện thoại không hợp lệ.";
    setErrors(next);
    if (Object.keys(next).length === 0) mutation.mutate({ fullName: form.fullName.trim(), phone: form.phone.replace(/\s/g, "") });
  };

  return (
    <div className="container page page--narrow">
      <h1>Hồ sơ của tôi</h1>
      <div className="card profile">
        <dl className="profile__info">
          <div><dt>Tên đăng nhập</dt><dd>{user.username}</dd></div>
          <div><dt>Email</dt><dd>{user.email}</dd></div>
          <div><dt>Vai trò</dt><dd><span className="badge">{user.role === "ADMIN" ? "Quản trị viên" : "Khách hàng"}</span></dd></div>
        </dl>

        <form onSubmit={handleSubmit} noValidate>
          <h2>Thông tin cá nhân</h2>
          <Alert>{mutation.isError && getErrorMessage(mutation.error, "Cập nhật thất bại.")}</Alert>
          <Alert type="success">{mutation.isSuccess && "Đã cập nhật hồ sơ."}</Alert>

          <label className="field">
            <span>Họ và tên</span>
            <input value={form.fullName} onChange={setField("fullName")} placeholder="Nguyễn Văn A" />
            {errors.fullName && <small className="field__error">{errors.fullName}</small>}
          </label>
          <label className="field">
            <span>Số điện thoại</span>
            <input type="tel" value={form.phone} onChange={setField("phone")} placeholder="0901234567" />
            {errors.phone && <small className="field__error">{errors.phone}</small>}
          </label>
          <button type="submit" className="btn" disabled={mutation.isPending}>
            {mutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </form>
      </div>
    </div>
  );
}
