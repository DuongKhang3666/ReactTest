import StatusBadge from "../../../components/common/StatusBadge";
import trash from "../../../assets/trash.svg";

// format -> dd/mm/yyyy
function formatDate(value) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);
    // nếu date ko đúng typedata thì sẽ trả NaN
    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    // thêm số 0 vào những số dưới 10
    const pad = (part) => String(part).padStart(2, "0");
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} · ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function VehicleDetailScreen({ vehicle, onBack, onDelete }) {
    return (
        <section className="vehicle-screen">
            <header className="vehicle-screen-header">
                <div className="vehicle-screen-eyebrow">HỆ THỐNG ĐẶT VÉ XE</div>
                <h1>Chi tiết xe</h1>
                <p>{vehicle.plate}</p>
            </header>

            <section className="vehicle-detail-card" aria-label="Thông tin xe">
                <div className="vehicle-detail-grid">
                    <div className="vehicle-detail-item">
                        <span>ID</span>
                        <strong>{vehicle.id}</strong>
                    </div>
                    <div className="vehicle-detail-item">
                        <span>Biển số</span>
                        <strong>{vehicle.plate}</strong>
                    </div>
                    <div className="vehicle-detail-item">
                        <span>Loại xe</span>
                        <strong>{vehicle.type}</strong>
                    </div>
                    <div className="vehicle-detail-item">
                        <span>Số ghế</span>
                        <strong>{vehicle.seats}</strong>
                    </div>
                    <div className="vehicle-detail-item vehicle-detail-description">
                        <span>Mô tả</span>
                        <strong>{vehicle.description || "—"}</strong>
                    </div>
                    <div className="vehicle-detail-item">
                        <span>Trạng thái</span>
                        <StatusBadge active={vehicle.active} />
                    </div>
                    <div className="vehicle-detail-item">
                        <span>Ngày tạo</span>
                        <strong>{formatDate(vehicle.createdAt)}</strong>
                    </div>
                    <div className="vehicle-detail-item">
                        <span>Cập nhật lần cuối</span>
                        <strong>{formatDate(vehicle.updatedAt)}</strong>
                    </div>
                </div>

                <footer className="vehicle-screen-footer vehicle-detail-footer">
                    <button
                        type="button"
                        className="vehicle-screen-button vehicle-screen-button-outline"
                        onClick={onBack}
                    >
                        <span aria-hidden="true">‹</span>
                        Quay lại
                    </button>
                    <button
                        type="button"
                        className="vehicle-screen-button vehicle-screen-button-danger"
                        onClick={onDelete}
                    >
                        <img src={trash} alt="" />
                        Xóa
                    </button>
                </footer>
            </section>
        </section>
    );
}
