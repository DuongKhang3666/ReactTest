import { Component } from "react";

/** Bắt lỗi render để không bị trang trắng: hiện thông báo + chi tiết lỗi. */
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ maxWidth: 640, margin: "60px auto", padding: 20, fontFamily: "system-ui" }}>
        <h1>Ứng dụng gặp lỗi</h1>
        <p>Hãy chụp màn hình lỗi dưới đây gửi cho người phụ trách, rồi thử tải lại trang.</p>
        <pre style={{ background: "#fdeaea", padding: 12, borderRadius: 8, whiteSpace: "pre-wrap" }}>
          {String(this.state.error?.stack ?? this.state.error)}
        </pre>
        <button type="button" onClick={() => { localStorage.clear(); location.reload(); }}>
          Xóa dữ liệu lưu cục bộ và tải lại
        </button>
      </div>
    );
  }
}
