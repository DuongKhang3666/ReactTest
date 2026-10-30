import { useState } from "react";

const emptyForm = {
    plate: "",
    type: "",
    seats: 12,
    active: true,
    description: "",
};

export default function VehicleForm({ vehicle, onSubmit, onCancel, layout = "modal" }) {
    const [form, setForm] = useState(() => {
        if (!vehicle) {
            return { ...emptyForm };
        }

        return {
            plate: vehicle.plate ?? "",
            type: vehicle.type ?? "",
            seats: vehicle.seats ?? 12,
            active: vehicle.active ?? true,
            description: vehicle.description ?? "",
        };
    });

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? checked
                    : name === "seats"
                        ? Number(value)
                        : value,
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        onSubmit({
            ...form,
            seats: Number(form.seats),
        });
    };

    return (
        <form
            className={`vehicle-form ${layout === "page" ? "vehicle-form-page" : ""}`}
            onSubmit={handleSubmit}
        >
            <div className="vehicle-form-fields">
                {/* Biển số */}
                <div className="form-group">
                    <label htmlFor="plate">
                        Biển số{layout === "page" && " *"}
                    </label>
                    <input
                        id="plate"
                        name="plate"
                        value={form.plate}
                        onChange={handleChange}
                        placeholder={layout === "page" ? "Nhập biển số" : "VD: 51B-123.45"}
                        maxLength={20}
                        required
                    />
                    {layout === "page" && <small>Tối đa 20 ký tự</small>}
                </div>

                {/* Loại xe */}
                <div className="form-group">
                    <label htmlFor="type">
                        Loại xe{layout === "page" && " *"}
                    </label>
                    <input
                        id="type"
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                        placeholder={layout === "page" ? "Nhập loại xe" : "VD: Limousine 22 chỗ"}
                        maxLength={50}
                        required
                    />
                    {layout === "page" && <small>Tối đa 50 ký tự</small>}
                </div>

                {/* Số ghế */}
                <div className="form-group">
                    <label htmlFor="seats">
                        Số ghế{layout === "page" && " *"}
                    </label>
                    <select
                        id="seats"
                        name="seats"
                        value={form.seats}
                        onChange={handleChange}
                        required
                    >
                        <option value={12}>12 ghế</option>
                        <option value={24}>24 ghế</option>
                        <option value={36}>36 ghế</option>
                    </select>
                </div>

                {layout === "page" ? (
                    <div className="form-group">
                        <label htmlFor="active">Trạng thái *</label>
                        <select
                            id="active"
                            name="active"
                            value={form.active ? "true" : "false"}
                            onChange={(event) => setForm((prev) => ({
                                ...prev,
                                active: event.target.value === "true",
                            }))}
                        >
                            <option value="true">Hoạt động</option>
                            <option value="false">Ngừng hoạt động</option>
                        </select>
                    </div>
                ) : (
                    <label className="form-checkbox">
                        <input
                            type="checkbox"
                            name="active"
                            checked={form.active}
                            onChange={handleChange}
                        />
                        <span>Xe đang hoạt động</span>
                    </label>
                )}

                {layout === "page" && (
                    <div className="form-group vehicle-description-group">
                        <label htmlFor="description">Mô tả</label>
                        <textarea
                            id="description"
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Nhập mô tả (không bắt buộc)"
                            maxLength={255}
                            rows={4}
                        />
                        <small>Tối đa 255 ký tự</small>
                    </div>
                )}
            </div>

            <div className={`vehicle-form-actions ${layout === "page" ? "vehicle-form-page-actions" : ""}`}>
                <button
                    type="button"
                    className="modal-button modal-button-cancel"
                    onClick={onCancel}
                >
                    Hủy
                </button>
                <button
                    type="submit"
                    className="modal-button modal-button-submit"
                >
                    {vehicle ? "Lưu thay đổi" : "Tạo xe"}
                </button>
            </div>
        </form>
    );
}
