import Icon from "./Icon";

// "Điểm đi -> Điểm đến" với mũi tên SVG
export default function RouteLabel({ from, to }) {
  return (
    <span>{from} <Icon name="arrow-right" size={14} /> {to}</span>
  );
}
