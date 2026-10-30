import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import Alert from "../../components/common/Alert";
import { getErrorMessage } from "../../utils/format";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from; // trang định vào trước khi bị chuyển sang login (kèm state)

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  // Đăng nhập là thao tác gửi dữ liệu lên server -> dùng useMutation
  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (user) => {
      if (user.role === "ADMIN") navigate("/admin/dashboard", { replace: true });
      else navigate(from?.pathname ?? "/", { replace: true, state: from?.state });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!email.includes("@")) newErrors.email = "Email không hợp lệ.";
    if (!password) newErrors.password = "Vui lòng nhập mật khẩu.";
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      mutation.mutate({ email: email.trim(), password });
    }
  };

  return (
    <div className="container">
      <form className="card narrow" onSubmit={handleSubmit} noValidate>
        <h1>Đăng nhập</h1>
        <p className="muted">Chào mừng bạn quay lại!</p>

        <Alert>{mutation.isError && getErrorMessage(mutation.error)}</Alert>

        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="a@example.com" />
          {errors.email && <small className="error">{errors.email}</small>}
        </label>

        <label>
          Mật khẩu
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {errors.password && <small className="error">{errors.password}</small>}
        </label>

        <button type="submit" className="btn" disabled={mutation.isPending}>
          {mutation.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>

        <p className="state">Chưa có tài khoản? <Link to="/register">Đăng ký</Link></p>
      </form>
    </div>
  );
}
