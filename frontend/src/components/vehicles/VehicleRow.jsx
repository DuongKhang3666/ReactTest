
import StatusBadge from "../common/StatusBadge";
import eyes from "../../assets/eyes.png";
import edit from "../../assets/modify.svg";
import trash from "../../assets/trash.svg";

export default function VehicleRow({ vehicle, onView, onEdit, onDelete }) {
    return (
        <tr className="vehicle-row">
            <td>{vehicle.id}</td>
            <td>{vehicle.plate}</td>
            <td>{vehicle.type}</td>
            <td>{vehicle.seats}</td>
            <td>
                <StatusBadge active={vehicle.active} />
            </td>

            <td className="vehicle-actions-cell">
                <div className="vehicle-row-actions">
                    <button
                        type="button"
                        className="vehicle-action-button"
                        aria-label={`Xem xe ${vehicle.id}`}
                        onClick={() => onView(vehicle)}
                    >
                        <img src={eyes} alt="" className="vehicle-action-icon" />
                        Xem
                    </button>

                    <button
                        type="button"
                        className="vehicle-action-button"
                        aria-label={`Sửa xe ${vehicle.id}`}
                        onClick={() => onEdit(vehicle)}
                    >
                        <img src={edit} alt="" className="vehicle-action-icon" />
                        Sửa
                    </button>

                    <button
                        type="button"
                        className="vehicle-action-button vehicle-action-delete"
                        aria-label={`Xóa xe ${vehicle.id}`}
                        onClick={() => onDelete(vehicle)}
                    >
                        <img src={trash} alt="" className="vehicle-action-icon" />
                        Xóa
                    </button>
                </div>
            </td>
        </tr>
    );
}
