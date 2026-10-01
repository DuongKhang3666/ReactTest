import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import Alert from "../../components/common/Alert";
import { getErrorMessage } from "../../utils/format";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  // Đăng nhập là thao tác ghi -> useMutation. Sau khi thành công GuestRoute tự chuyển trang.
  const mutation = useMutation({ mutationFn: login });

  const setField = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (!EMAIL_RE.test(form.email)) next.email = "Email không hợp lệ.";
    if (!form.password) next.password = "Vui lòng nhập mật khẩu.";
    setErrors(next);
    if (Object.keys(next).length === 0) mutation.mutate({ email: form.email.trim(), password: form.password });
  };

  return (
    <div className="auth">
      <form className="card auth__card" onSubmit={handleSubmit} noValidate>
        <h1>Đăng nhập</h1>
        <p className="muted">Chào mừng bạn quay lại!</p>

        <Alert>{mutation.isError && getErrorMessage(mutation.error, "Đăng nhập thất bại.")}</Alert>

        <label className="field">
          <span>Email</span>
          <input type="email" autoComplete="email" value={form.email} onChange={setField("email")} placeholder="a@example.com" />
          {errors.email && <small className="field__error">{errors.email}</small>}
        </label>
        <label className="field">
          <span>Mật khẩu</span>
          <input type="password" autoComplete="current-password" value={form.password} onChange={setField("password")} />
          {errors.password && <small className="field__error">{errors.password}</small>}
        </label>

        <button type="submit" className="btn btn--block" disabled={mutation.isPending}>
          {mutation.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
        <p className="center muted">Chưa có tài khoản? <Link to="/register">Đăng ký</Link></p>
        <details className="demo-accounts">
          <summary>Tài khoản demo (chế độ mock)</summary>
          <p>Khách: <code>a@example.com</code> / <code>123456</code></p>
          <p>Admin: <code>admin@example.com</code> / <code>admin123</code></p>
        </details>
      </form>
    </div>
  );
}
