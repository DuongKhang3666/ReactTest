// `value` là giá trị gửi lên API (?from=TP.HCM&to=Đà Nẵng) - PHẢI trùng với cột
// departure_city / destination_city trong bảng routes của database.
export const CITIES = [
  { value: "TP.HCM", label: "TP. Hồ Chí Minh" },
  { value: "Hà Nội", label: "Hà Nội" },
  { value: "Đà Nẵng", label: "Đà Nẵng" },
  { value: "Quảng Ngãi", label: "Quảng Ngãi" },
  { value: "Đà Lạt", label: "Đà Lạt" },
  { value: "Nha Trang", label: "Nha Trang" },
  { value: "Cần Thơ", label: "Cần Thơ" },
  { value: "Huế", label: "Huế" },
  { value: "Vũng Tàu", label: "Vũng Tàu" },
];

export const cityLabel = (value) => CITIES.find((c) => c.value === value)?.label ?? value;
