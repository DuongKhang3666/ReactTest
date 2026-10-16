import { useState } from "react";
import { CITIES } from "../../utils/cities";
import { toDateInputValue } from "../../utils/format";

// Form tìm chuyến - dùng ở trang chủ và trang tìm chuyến
export default function SearchForm({ initial = {}, onSubmit, submitLabel = "Tìm chuyến" }) {
  const [from, setFrom] = useState(initial.from ?? "");
  const [to, setTo] = useState(initial.to ?? "");
  const [date, setDate] = useState(initial.date ?? toDateInputValue());
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (from && from === to) {
      setError("Điểm đi và điểm đến phải khác nhau.");
      return;
    }
    setError("");
    onSubmit({ from, to, date });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="search">
        <label>
          Điểm đi
          <select value={from} onChange={(e) => setFrom(e.target.value)}>
            <option value="">Tất cả</option>
            {CITIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </label>
        <label>
          Điểm đến
          <select value={to} onChange={(e) => setTo(e.target.value)}>
            <option value="">Tất cả</option>
            {CITIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </label>
        <label>
          Ngày đi
          <input type="date" value={date} min={toDateInputValue()} onChange={(e) => setDate(e.target.value)} />
        </label>
        <button type="submit" className="btn">{submitLabel}</button>
      </div>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
