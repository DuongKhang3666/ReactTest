import { DEFAULT_FILTERS, PRICE_RANGES, TIME_SLOTS } from "../../utils/tripFilters";

// Thêm value vào danh sách nếu chưa có, bỏ ra nếu đã có
function toggleItem(list, value) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export default function TripFilters({ filters, busTypes, onChange }) {
  return (
    <aside className="card">
      <div className="row">
        <strong>Bộ lọc</strong>
        <button type="button" className="link blue" onClick={() => onChange(DEFAULT_FILTERS)}>Xóa lọc</button>
      </div>

      <fieldset>
        <legend>Giờ đi</legend>
        {TIME_SLOTS.map((slot) => (
          <label className="check" key={slot.id}>
            <input
              type="checkbox"
              checked={filters.slots.includes(slot.id)}
              onChange={() => onChange({ ...filters, slots: toggleItem(filters.slots, slot.id) })}
            />
            {slot.label}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>Loại xe</legend>
        {busTypes.map((type) => (
          <label className="check" key={type}>
            <input
              type="checkbox"
              checked={filters.busTypes.includes(type)}
              onChange={() => onChange({ ...filters, busTypes: toggleItem(filters.busTypes, type) })}
            />
            {type}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>Giá vé</legend>
        {PRICE_RANGES.map((range) => (
          <label className="check" key={range.id}>
            <input
              type="radio"
              name="priceRange"
              checked={filters.priceRange === range.id}
              onChange={() => onChange({ ...filters, priceRange: range.id })}
            />
            {range.label}
          </label>
        ))}
      </fieldset>

      <label className="check">
        <input type="checkbox" checked={filters.hideSoldOut} onChange={(e) => onChange({ ...filters, hideSoldOut: e.target.checked })} />
        Ẩn chuyến hết chỗ
      </label>
    </aside>
  );
}
