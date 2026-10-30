import { Outlet } from "react-router-dom";

// Bọc các trang do FE1 làm trong class "fe1" để áp dụng CSS của FE1.
// (Các trang FE2/FE3 không đi qua đây nên giữ nguyên giao diện riêng của chúng.)
export default function Fe1Scope() {
  return (
    <div className="fe1">
      <Outlet />
    </div>
  );
}
