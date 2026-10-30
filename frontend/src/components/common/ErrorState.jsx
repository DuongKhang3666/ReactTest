import { getErrorMessage } from "../../utils/format";

export default function ErrorState({ error, onRetry, title = "Không thể tải dữ liệu" }) {
  return (
    <div className="state">
      <p className="error"><strong>{title}</strong></p>
      <p>{getErrorMessage(error)}</p>
      {onRetry && <button type="button" className="btn btn-outline" onClick={onRetry}>Thử lại</button>}
    </div>
  );
}
