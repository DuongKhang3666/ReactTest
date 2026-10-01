// `value` là giá trị gửi lên API (?from=TPHCM&to=DaNang) - đổi tại đây nếu BE dùng quy ước khác.
export const CITIES = [
  { value: "TPHCM", label: "TP. Hồ Chí Minh" },
  { value: "HaNoi", label: "Hà Nội" },
  { value: "DaNang", label: "Đà Nẵng" },
  { value: "DaLat", label: "Đà Lạt" },
  { value: "NhaTrang", label: "Nha Trang" },
  { value: "CanTho", label: "Cần Thơ" },
  { value: "Hue", label: "Huế" },
  { value: "VungTau", label: "Vũng Tàu" },
];

export const cityLabel = (value) => CITIES.find((c) => c.value === value)?.label ?? value;
