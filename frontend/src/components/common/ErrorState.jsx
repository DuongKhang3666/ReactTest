import { getErrorMessage } from "../../utils/format";

export default function ErrorState({ error, onRetry, title = "Không thể tải dữ liệu" }) {
  return (
    <div className="state state--error" role="alert">
      <strong>{title}</strong>
      <p>{getErrorMessage(error)}</p>
      {onRetry && (
        <button type="button" className="btn btn--outline" onClick={onRetry}>
          Thử lại
        </button>
      )}
    </div>
  );
}
