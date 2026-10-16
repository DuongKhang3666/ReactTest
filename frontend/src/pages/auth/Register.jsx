import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import Alert from "../../components/common/Alert";
import { getErrorMessage } from "../../utils/format";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});

  const mutation = useMutation({
    mutationFn: register,
    onSuccess: () => navigate("/", { replace: true }),
  });

  // Cập nhật một ô nhập: setField("email")(event)
  const setField = (name) => (e) => setForm({ ...form, [name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (form.username.trim().length < 3) newErrors.username = "Tên đăng nhập tối thiểu 3 ký tự.";
    if (!form.email.includes("@")) newErrors.email = "Email không hợp lệ.";
    if (form.password.length < 6) newErrors.password = "Mật khẩu tối thiểu 6 ký tự.";
    if (form.confirm !== form.password) newErrors.confirm = "Mật khẩu nhập lại không khớp.";
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      mutation.mutate({ username: form.username.trim(), email: form.email.trim(), password: form.password });
    }
  };

  return (
    <div className="container">
      <form className="card narrow" onSubmit={handleSubmit} noValidate>
        <h1>Đăng ký</h1>
        <p className="muted">Tạo tài khoản để đặt vé nhanh hơn.</p>

        <Alert>{mutation.isError && getErrorMessage(mutation.error)}</Alert>

        <label>
          Tên đăng nhập
          <input value={form.username} onChange={setField("username")} />
          {errors.username && <small className="error">{errors.username}</small>}
        </label>

        <label>
          Email
          <input type="email" value={form.email} onChange={setField("email")} />
          {errors.email && <small className="error">{errors.email}</small>}
        </label>

        <label>
          Mật khẩu
          <input type="password" value={form.password} onChange={setField("password")} />
          {errors.password && <small className="error">{errors.password}</small>}
        </label>

        <label>
          Nhập lại mật khẩu
          <input type="password" value={form.confirm} onChange={setField("confirm")} />
          {errors.confirm && <small className="error">{errors.confirm}</small>}
        </label>

        <button type="submit" className="btn" disabled={mutation.isPending}>
          {mutation.isPending ? "Đang tạo tài khoản..." : "Đăng ký"}
        </button>

        <p className="state">Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
      </form>
    </div>
  );
}
