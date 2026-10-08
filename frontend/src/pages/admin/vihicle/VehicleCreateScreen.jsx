import VehicleForm from "../../../components/vehicle/VehicleForm";

export default function VehicleCreateScreen({ onCancel, onSubmit }) {
    return (
        <section className="vehicle-screen">
            <header className="vehicle-screen-header vehicle-create-header">
                <div className="vehicle-screen-eyebrow">HỆ THỐNG ĐẶT VÉ XE</div>
                <h1>Tạo xe</h1>
                <p>Thêm phương tiện mới vào hệ thống</p>
            </header>

            <section className="vehicle-create-card" aria-label="Thông tin xe mới">
                <VehicleForm
                    layout="page"
                    onCancel={onCancel}
                    onSubmit={onSubmit}
                />
            </section>
        </section>
    );
}
