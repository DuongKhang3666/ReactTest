import RouteForm from "../../../components/routes/RouteForm";

export default function RouteCreateScreen({ onCancel, onSubmit }) {
    return (
        <section className="route-screen">
            <header className="route-screen-header">
                <div className="route-screen-eyebrow">HỆ THỐNG ĐẶT VÉ XE</div>
                <h1>Tạo tuyến</h1>
                <p>Thêm tuyến đường mới vào hệ thống</p>
            </header>
            <section className="route-form-card" aria-label="Thông tin tuyến mới">
                <RouteForm onCancel={onCancel} onSubmit={onSubmit} />
            </section>
        </section>
    );
}
