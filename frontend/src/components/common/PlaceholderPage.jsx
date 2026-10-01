import { Link } from "react-router-dom";
import EmptyState from "./EmptyState";

/** Trang tạm cho phần của FE2/FE3 - thay bằng page thật khi merge. */
export default function PlaceholderPage({ title, owner }) {
  return (
    <div className="container page">
      <EmptyState icon="info" title={title}>
        Trang này thuộc phần của {owner} và sẽ được bổ sung khi merge.
      </EmptyState>
      <p className="center"><Link to="/" className="btn btn--outline">Về trang chủ</Link></p>
    </div>
  );
}
