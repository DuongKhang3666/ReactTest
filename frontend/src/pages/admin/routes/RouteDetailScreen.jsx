import StatusBadge from "../../../components/common/StatusBadge";
import trash from "../../../assets/trash.svg";

export default function RouteDetailScreen({ route, onBack, onDelete }) {
    return (
        <section className="route-screen">
            <header className="route-screen-header">
                <div className="route-screen-eyebrow">HỆ THỐNG ĐẶT VÉ XE</div>
                <h1>Chi tiết tuyến {route.id}</h1>
                <p>{route.departureCity} → {route.destinationCity}</p>
            </header>
            <section className="route-detail-card" aria-label="Thông tin tuyến đường">
                <div className="route-detail-grid">
                    <div className="route-detail-item">
                        <span>ID</span>
                        <strong>{route.id}</strong>
                    </div>
                    <div className="route-detail-item">
                        <span>Trạng thái</span>
                        <StatusBadge active={route.active} />
                    </div>
                    <div className="route-detail-item">
                        <span>Thành phố đi</span>
                        <strong>{route.departureCity}</strong>
                    </div>
                    <div className="route-detail-item">
                        <span>Thành phố đến</span>
                        <strong>{route.destinationCity}</strong>
                    </div>
                    <div className="route-detail-item">
                        <span>Bến đi</span>
                        <strong>{route.departureStation}</strong>
                    </div>
                    <div className="route-detail-item">
                        <span>Bến đến</span>
                        <strong>{route.arrivalStation}</strong>
                    </div>
                    <div className="route-detail-item">
                        <span>Khoảng cách</span>
                        <strong>{route.distanceKm} km</strong>
                    </div>
                    <div className="route-detail-item">
                        <span>Thời lượng</span>
                        <strong>{route.durationMinutes} phút</strong>
                    </div>
                </div>
                <footer className="route-screen-footer">
                    <button
                        type="button"
                        className="route-screen-button"
                        onClick={onBack}
                    >
                        <span aria-hidden="true">‹</span>
                        Quay lại
                    </button>
                    <button
                        type="button"
                        className="route-screen-button route-screen-button-danger"
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
