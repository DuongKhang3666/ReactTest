import VehicleForm from "../../../components/vehicles/VehicleForm";

export default function VehicleEditScreen({ vehicle, onCancel, onSubmit }) {
    return (
        <section className="vehicle-screen">
            <header className="vehicle-screen-header">
                <h1>Sửa xe {vehicle.id}</h1>
                <p>Cập nhật thông tin phương tiện</p>
            </header>

            <section className="vehicle-create-card">
                <VehicleForm
                    key={vehicle.id}
                    vehicle={vehicle}
                    layout="page"
                    onCancel={onCancel}
                    onSubmit={onSubmit}
                />
            </section>
        </section>
    );
}