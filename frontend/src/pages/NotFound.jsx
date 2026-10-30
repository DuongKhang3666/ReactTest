import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container">
      <div className="card narrow">
        <h1>404 - Không tìm thấy trang</h1>
        <p className="muted">Đường dẫn bạn truy cập không tồn tại hoặc đã bị di chuyển.</p>
        <p><Link to="/" className="btn">Về trang chủ</Link></p>
      </div>
    </div>
  );
}
