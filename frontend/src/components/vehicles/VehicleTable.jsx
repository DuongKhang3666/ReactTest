import VehicleRow from "./VehicleRow";
import "./Vehicle.css";

export default function VehicleTable({ vehicles, onView, onEdit, onDelete }) {
    return (
        <div className="vehicle-table-wrapper">
            <table className="vehicle-table" aria-label="Danh sách xe">
                <colgroup>
                    <col className="vehicle-column-id" />
                    <col className="vehicle-column-plate" />
                    <col className="vehicle-column-type" />
                    <col className="vehicle-column-seats" />
                    <col className="vehicle-column-status" />
                    <col className="vehicle-column-actions" />
                </colgroup>
                <thead>
                <tr>
                    <th scope="col">ID</th>
                    <th scope="col">BIỂN SỐ</th>
                    <th scope="col">LOẠI XE</th>
                    <th scope="col">SỐ GHẾ</th>
                    <th scope="col">TRẠNG THÁI</th>
                    <th scope="col">THAO TÁC</th>
                </tr>
                </thead>

                <tbody>
                {vehicles.length === 0 ? (
                    <tr>
                        <td
                            colSpan="6"
                            className="vehicle-empty"
                        >
                            Chưa có xe nào
                        </td>
                    </tr>
                ) : (
                    vehicles.map((vehicle) => (
                        <VehicleRow
                            key={vehicle.id}
                            vehicle={vehicle}
                            onView={onView}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))
                )}
                </tbody>
            </table>
        </div>
    );
}
