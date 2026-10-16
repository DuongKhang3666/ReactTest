import { Link } from "react-router-dom";
import EmptyState from "./EmptyState";

// Trang tạm cho phần của FE2/FE3 - thay bằng trang thật khi merge.
export default function PlaceholderPage({ title, owner }) {
  return (
    <div className="container">
      <EmptyState icon="info" title={title}>
        <p>Trang này thuộc phần của {owner}, sẽ được bổ sung khi merge.</p>
      </EmptyState>
      <p className="state"><Link to="/" className="btn btn-outline">Về trang chủ</Link></p>
    </div>
  );
}
