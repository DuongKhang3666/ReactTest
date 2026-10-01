import Icon from "./Icon";

/** Điểm đi, mũi tên SVG, điểm đến. `stacked`: xếp hai dòng (dùng trong thẻ hẹp). */
export default function RouteLabel({ from, to, stacked = false }) {
  return (
    <span className={stacked ? "route-label route-label--stack" : "route-label"}>
      <span>{from}</span>
      <Icon name="arrow-right" size={14} className="route-label__arrow" />
      <span>{to}</span>
    </span>
  );
}
