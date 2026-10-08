
import VehicleForm from "./VehicleForm";

export default function VehicleModal({open, vehicle, onClose, onSubmit, }) {
    if (!open) { return null; }

    const isEdit = Boolean(vehicle);

    return (
        <div
            className="modal-overlay"
            onMouseDown={onClose}
        >
            <div
                className="vehicle-modal"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <div className="modal-header">
                    <div>
                        <div className="modal-subtitle">
                            QUẢN LÝ XE
                        </div>

                        <h2>
                            {isEdit ? "Chỉnh sửa xe" : "Tạo xe mới"}
                        </h2>
                    </div>

                    <button
                        type="button"
                        className="modal-close"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                <VehicleForm
                    vehicle={vehicle}
                    onSubmit={onSubmit}
                    onCancel={onClose}
                />
            </div>
        </div>
    );
}
