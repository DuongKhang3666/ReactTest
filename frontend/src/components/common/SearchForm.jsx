import { useState } from "react";
import { CITIES } from "../../utils/cities";
import { toDateInputValue } from "../../utils/format";
import Icon from "./Icon";

/** Form tìm chuyến - dùng ở Home và SearchTrips. UI state (input) dùng useState. */
export default function SearchForm({ initial = {}, onSubmit, submitLabel = "Tìm chuyến" }) {
  const [from, setFrom] = useState(initial.from ?? "");
  const [to, setTo] = useState(initial.to ?? "");
  const [date, setDate] = useState(initial.date ?? toDateInputValue());
  const [error, setError] = useState("");

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (from && to && from === to) {
      setError("Điểm đi và điểm đến phải khác nhau.");
      return;
    }
    setError("");
    onSubmit({ from, to, date });
  };

  return (
    <form className="search-form" onSubmit={handleSubmit} noValidate>
      <label className="field">
        <span>Điểm đi</span>
        <select value={from} onChange={(e) => setFrom(e.target.value)}>
          <option value="">Tất cả</option>
          {CITIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </label>
      <button type="button" className="search-form__swap" onClick={swap} aria-label="Đổi chiều đi/đến" title="Đổi chiều đi/đến"><Icon name="swap" size={18} /></button>
      <label className="field">
        <span>Điểm đến</span>
        <select value={to} onChange={(e) => setTo(e.target.value)}>
          <option value="">Tất cả</option>
          {CITIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </label>
      <label className="field">
        <span>Ngày đi</span>
        <input type="date" value={date} min={toDateInputValue()} onChange={(e) => setDate(e.target.value)} required />
      </label>
      <button type="submit" className="btn btn--lg">{submitLabel}</button>
      {error && <p className="field__error search-form__error">{error}</p>}
    </form>
  );
}
