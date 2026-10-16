import RouteForm from "../../../components/routes/RouteForm";

export default function RouteEditScreen({ route, onCancel, onSubmit }) {
    return (
        <section className="route-screen">
            <header className="route-screen-header">
                <div className="route-screen-eyebrow">HỆ THỐNG ĐẶT VÉ XE</div>
                <h1>Sửa tuyến {route.id}</h1>
                <p>Cập nhật thông tin tuyến đường</p>
            </header>
            <section className="route-form-card" aria-label="Cập nhật thông tin tuyến">
                <RouteForm
                    key={route.id}
                    route={route}
                    onCancel={onCancel}
                    onSubmit={onSubmit}
                />
            </section>
        </section>
    );
}
