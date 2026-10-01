import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import Alert from "../../components/common/Alert";
import { getErrorMessage } from "../../utils/format";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate({ username, email, password, confirm }) {
  const e = {};
  if (!/^[A-Za-z0-9_.]{3,50}$/.test(username)) e.username = "3–50 ký tự: chữ, số, dấu _ hoặc .";
  if (!EMAIL_RE.test(email)) e.email = "Email không hợp lệ.";
  if (password.length < 6) e.password = "Mật khẩu tối thiểu 6 ký tự.";
  if (confirm !== password) e.confirm = "Mật khẩu nhập lại không khớp.";
  return e;
}

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const mutation = useMutation({ mutationFn: register });

  const setField = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = validate(form);
    setErrors(next);
    if (Object.keys(next).length === 0) {
      mutation.mutate({ username: form.username.trim(), email: form.email.trim(), password: form.password });
    }
  };

  const fields = [
    ["username", "Tên đăng nhập", "text", "username"],
    ["email", "Email", "email", "email"],
    ["password", "Mật khẩu", "password", "new-password"],
    ["confirm", "Nhập lại mật khẩu", "password", "new-password"],
  ];

  return (
    <div className="auth">
      <form className="card auth__card" onSubmit={handleSubmit} noValidate>
        <h1>Đăng ký</h1>
        <p className="muted">Tạo tài khoản để đặt vé nhanh hơn.</p>

        <Alert>{mutation.isError && getErrorMessage(mutation.error, "Đăng ký thất bại.")}</Alert>

        {fields.map(([name, label, type, auto]) => (
          <label className="field" key={name}>
            <span>{label}</span>
            <input type={type} autoComplete={auto} value={form[name]} onChange={setField(name)} />
            {errors[name] && <small className="field__error">{errors[name]}</small>}
          </label>
        ))}

        <button type="submit" className="btn btn--block" disabled={mutation.isPending}>
          {mutation.isPending ? "Đang tạo tài khoản..." : "Đăng ký"}
        </button>
        <p className="center muted">Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
      </form>
    </div>
  );
}
