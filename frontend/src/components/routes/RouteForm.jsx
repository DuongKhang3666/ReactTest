import { useState } from "react";
import { CITIES } from "../../utils/cities";

const emptyForm = {
    departureCity: "",
    destinationCity: "",
    departureStation: "",
    arrivalStation: "",
    distanceKm: "",
    durationMinutes: "",
    active: true,
};

export default function RouteForm({ route, onCancel, onSubmit }) {
    const [form, setForm] = useState(() => route
        ? {
            departureCity: route.departureCity ?? "",
            destinationCity: route.destinationCity ?? "",
            departureStation: route.departureStation ?? "",
            arrivalStation: route.arrivalStation ?? "",
            distanceKm: route.distanceKm ?? "",
            durationMinutes: route.durationMinutes ?? "",
            active: route.active ?? true,
        }
        : { ...emptyForm });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit({
            ...form,
            distanceKm: Number(form.distanceKm),
            durationMinutes: Number(form.durationMinutes),
        });
    };

    return (
        <form className="route-form" onSubmit={handleSubmit}>
            <div className="route-form-fields">
                <div className="route-form-group">
                    <label htmlFor="departureCity">Thành phố đi *</label>
                    <select
                        id="departureCity"
                        name="departureCity"
                        value={form.departureCity}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Chọn thành phố đi</option>
                        {CITIES.map((city) => (
                            <option key={city.value} value={city.value}>
                                {city.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="route-form-group">
                    <label htmlFor="destinationCity">Thành phố đến *</label>
                    <select
                        id="destinationCity"
                        name="destinationCity"
                        value={form.destinationCity}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Chọn thành phố đến</option>
                        {CITIES.map((city) => (
                            <option key={city.value} value={city.value}>
                                {city.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="route-form-group">
                    <label htmlFor="departureStation">Bến đi *</label>
                    <input
                        id="departureStation"
                        name="departureStation"
                        value={form.departureStation}
                        onChange={handleChange}
                        placeholder="Nhập bến đi"
                        maxLength={150}
                        required
                    />
                </div>
                <div className="route-form-group">
                    <label htmlFor="arrivalStation">Bến đến *</label>
                    <input
                        id="arrivalStation"
                        name="arrivalStation"
                        value={form.arrivalStation}
                        onChange={handleChange}
                        placeholder="Nhập bến đến"
                        maxLength={150}
                        required
                    />
                </div>
                <div className="route-form-group">
                    <label htmlFor="distanceKm">Khoảng cách (km) *</label>
                    <input
                        id="distanceKm"
                        name="distanceKm"
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={form.distanceKm}
                        onChange={handleChange}
                        placeholder="Nhập khoảng cách"
                        required
                    />
                </div>
                <div className="route-form-group">
                    <label htmlFor="durationMinutes">Thời lượng (phút) *</label>
                    <input
                        id="durationMinutes"
                        name="durationMinutes"
                        type="number"
                        min="1"
                        step="1"
                        value={form.durationMinutes}
                        onChange={handleChange}
                        placeholder="Nhập thời lượng"
                        required
                    />
                </div>
                <div className="route-form-group">
                    <label htmlFor="active">Trạng thái *</label>
                    <select
                        id="active"
                        name="active"
                        value={form.active ? "true" : "false"}
                        onChange={(event) => setForm((current) => ({
                            ...current,
                            active: event.target.value === "true",
                        }))}
                    >
                        <option value="true">Hoạt động</option>
                        <option value="false">Ngừng hoạt động</option>
                    </select>
                </div>
            </div>
            <div className="route-form-actions">
                <button
                    type="button"
                    className="route-form-cancel"
                    onClick={onCancel}
                >
                    Hủy
                </button>
                <button type="submit" className="route-form-submit">
                    {route ? "Lưu thay đổi" : "Tạo tuyến"}
                </button>
            </div>
        </form>
    );
}
