import StatusBadge from "../common/StatusBadge";
import eyes from "../../assets/eyes.png";
import edit from "../../assets/modify.svg";
import trash from "../../assets/trash.svg";

export default function RouteRow({ route, onView, onEdit, onDelete }) {
    return (
        <tr className="route-row">
            <td>{route.id}</td>
            <td>{route.departureCity}</td>
            <td>{route.destinationCity}</td>
            <td>{route.departureStation}</td>
            <td>{route.arrivalStation}</td>
            <td>{route.distanceKm}</td>
            <td>{route.durationMinutes}</td>
            <td>
                <StatusBadge active={route.active} />
            </td>
            <td className="route-actions-cell">
                <div className="route-row-actions">
                    <button
                        type="button"
                        className="route-action-button"
                        aria-label={`Xem tuyến ${route.id}`}
                        onClick={() => onView(route)}
                    >
                        <img src={eyes} alt="" className="route-action-icon" />
                        Xem
                    </button>
                    <button
                        type="button"
                        className="route-action-button"
                        aria-label={`Sửa tuyến ${route.id}`}
                        onClick={() => onEdit(route)}
                    >
                        <img src={edit} alt="" className="route-action-icon" />
                        Sửa
                    </button>
                    <button
                        type="button"
                        className="route-action-button route-action-delete"
                        aria-label={`Xóa tuyến ${route.id}`}
                        onClick={() => onDelete(route)}
                    >
                        <img src={trash} alt="" className="route-action-icon" />
                        Xóa
                    </button>
                </div>
            </td>
        </tr>
    );
}
