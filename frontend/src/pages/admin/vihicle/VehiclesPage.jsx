import PageHeader from "../../../components/common/PageHeader";
import VehicleTable from "../../../components/vehicle/VehicleTable";
import VehicleModal from "../../../components/vehicle/VehicleModal";
import VehicleDetailScreen from "./VehicleDetailScreen";
import VehicleCreateScreen from "./VehicleCreateScreen";
import { useState } from "react";
import "./VehiclesPage.css";
import "./VehicleScreens.css";

// Dữ liệu xe mẫu ban đầu.
// Sau này phần này sẽ được thay bằng dữ liệu lấy từ API/backend.
const initialVehicles = [
    {
        id: "XE-001",
        plate: "51B-123.45",
        type: "Limousine 22 chỗ",
        seats: 22,
        active: true,
        description: "Xe limousine cao cấp phục vụ tuyến TP. Hồ Chí Minh - Đà Lạt.",
        createdAt: "2025-03-12T09:24:00",
        updatedAt: "2025-06-02T14:18:00",
    },
    {
        id: "XE-002",
        plate: "29B-678.90",
        type: "Giường nằm 40 chỗ",
        seats: 40,
        active: true,
    },
    {
        id: "XE-003",
        plate: "43B-246.80",
        type: "Ghế ngồi 29 chỗ",
        seats: 29,
        active: false,
    },
    {
        id: "XE-004",
        plate: "50F-135.79",
        type: "Limousine 16 chỗ",
        seats: 16,
        active: true,
    },
    {
        id: "XE-005",
        plate: "30G-975.31",
        type: "Giường nằm 34 chỗ",
        seats: 34,
        active: true,
    },
];

export default function VehiclesPage() {
    // State lưu danh sách xe hiện tại bằng initialVehicles.
    const [vehicles, setVehicles] = useState(initialVehicles);

    // State kiểm tra Modal đang mở hay đóng. (false=đóng, true=mở)
    const [modalOpen, setModalOpen] = useState(false);

    // Lưu chiếc xe đang được chọn để EDIT.
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [activeScreen, setActiveScreen] = useState(null);

    // Được gọi khi user bấm nút "Thêm xe".
    const handleCreate = () => {
        setActiveScreen({ type: "create" });
        setSelectedVehicle(null);
    };

    // Được gọi khi user bấm nút "Sửa" ở một chiếc xe.
    const handleEdit = (vehicle) => {
        // Lưu chiếc xe đang được sửa.
        setSelectedVehicle(vehicle);
        // Mở Modal.
        setModalOpen(true);
    };

    // Được gọi khi user bấm "Xem" một chiếc xe.
    const handleView = (vehicle) => {
        setActiveScreen({ type: "detail", vehicle });
    };

    // Được gọi khi user bấm "Xóa" một chiếc xe.
    const handleDelete = (vehicle) => {
        // Hiện popup xác nhận trước khi xóa.
        const confirmed = window.confirm(
            `Bạn có chắc muốn xóa xe ${vehicle.id}?`
        );

        // Nếu user bấm Cancel
        if (!confirmed) {
            return false;
        }

        // Nếu user bấm OK:
        // prev = danh sách vehicles hiện tại.
        // filter() tạo ra một danh sách mới,
        // chỉ giữ lại những xe KHÔNG có id bằng xe cần xóa.
        setVehicles((prev) =>
            prev.filter((item) => item.id !== vehicle.id)
        );
        return true;
    };

    // Hàm này được gọi khi user submit VehicleModal.
    // formData là dữ liệu user nhập trong form.
    const handleSubmit = (formData) => {
        // Nếu selectedVehicle khác null
        // -> user đang chỉnh sửa một xe đã tồn tại.
        // case đang Edit xe có sẵn.
        if (selectedVehicle) {
            setVehicles((prev) =>
                prev.map((vehicle) =>
                    vehicle.id === selectedVehicle.id

                        // Nếu đúng ghi đè bằng dữ liệu mới từ form.
                        ? {
                            ...vehicle,
                            ...formData,
                            updatedAt: new Date().toISOString(),
                        }

                        // Nếu không phải xe đang sửa:
                        // giữ nguyên.
                        : vehicle
                )
            );

        } else {
            const nextId = Math.max(
                0,
                ...vehicles.map((vehicle) => Number(vehicle.id.replace("XE-", "")) || 0)
            ) + 1;
            const timestamp = new Date().toISOString();
            const newVehicle = {
                id: `XE-${String(nextId).padStart(3, "0")}`,
                ...formData,
                createdAt: timestamp,
                updatedAt: timestamp,
            };

            // Thêm xe mới vào cuối danh sách.
            setVehicles((prev) => [
                ...prev,
                newVehicle,
            ]);
        }

        // đóng Modal.
        setModalOpen(false);
        // Reset xe đang chọn.
        setSelectedVehicle(null);
        setActiveScreen(null);
    };

    const handleDetailDelete = (vehicle) => {
        if (handleDelete(vehicle)) {
            setActiveScreen(null);
        }
    };

    // Được gọi khi user bấm nút reload trên PageHeader.
    const handleReload = () => {
        setVehicles(initialVehicles);
    };

    if (activeScreen?.type === "detail") {
        return (
            <VehicleDetailScreen
                vehicle={activeScreen.vehicle}
                onBack={() => setActiveScreen(null)}
                onDelete={() => handleDetailDelete(activeScreen.vehicle)}
            />
        );
    }

    if (activeScreen?.type === "create") {
        return (
            <VehicleCreateScreen
                onCancel={() => setActiveScreen(null)}
                onSubmit={handleSubmit}
            />
        );
    }

    return (
        <div className="vehicles-page">
            <PageHeader
                title="Quản lý xe"
                onReload={handleReload} // hàm chạy khi bấm Reload.
                onCreate={handleCreate} // hàm chạy khi bấm Thêm xe.
            />

            {/* Bảng xe */}
            <div className="vehicle-card">
                <VehicleTable
                    vehicles={vehicles}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>


            {/* 
                VehicleModal chịu trách nhiệm form Create/Edit.

                open:
                    Modal mở hay đóng.

                vehicle:
                    null -> Create
                    object -> Edit

                onClose:
                    đóng Modal.

                onSubmit:
                    submit form -> gọi handleSubmit().
            */}
            <VehicleModal
                open={modalOpen}
                vehicle={selectedVehicle}

                onClose={() => {
                    // Đóng Modal.
                    setModalOpen(false);
                    // Bỏ chiếc xe đang chọn.
                    setSelectedVehicle(null);
                }}
                onSubmit={handleSubmit}
            />

        </div>
    );
}
