import RouteRow from "../routes/RouteRow.jsx";
import "./Route.css";

export default function RouteTable({ routes, onView, onEdit, onDelete }) {
    return (
        <div className="route-table-wrapper">
            <table className="route-table" aria-label="Danh sách tuyến đường">
                <colgroup>
                    <col className="route-column-id" />
                    <col className="route-column-from" />
                    <col className="route-column-to" />
                    <col className="route-column-departure" />
                    <col className="route-column-arrival" />
                    <col className="route-column-distance" />
                    <col className="route-column-duration" />
                    <col className="route-column-status" />
                    <col className="route-column-actions" />
                </colgroup>
                <thead>
                <tr>
                    <th scope="col">ID</th>
                    <th scope="col">THÀNH PHỐ ĐI</th>
                    <th scope="col">THÀNH PHỐ ĐẾN</th>
                    <th scope="col">BẾN ĐI</th>
                    <th scope="col">BẾN ĐẾN</th>
                    <th scope="col">KHOẢNG CÁCH</th>
                    <th scope="col">THỜI LƯỢNG</th>
                    <th scope="col">TRẠNG THÁI</th>
                    <th scope="col">THAO TÁC</th>
                </tr>
                </thead>

                <tbody>
                {routes.length === 0 ? (
                    <tr>
                        <td
                            colSpan="9"
                            className="route-empty"
                        >
                            Chưa có tuyến nào
                        </td>
                    </tr>
                ) : (
                    routes.map((r) => (
                        <RouteRow
                            key={r.id}
                            route={r}
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