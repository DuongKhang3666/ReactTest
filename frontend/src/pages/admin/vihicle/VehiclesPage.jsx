import { useState } from "react";
import PageHeader from "../../../components/common/PageHeader";
import VehicleTable from "../../../components/vehicles/VehicleTable";
import VehicleDetailScreen from "./VehicleDetailScreen";
import VehicleCreateScreen from "./VehicleCreateScreen";
import VehicleEditScreen from "./VehicleEditScreen";
import DeleteConfirmModal from "../../../components/common/DeleteConfirmModal";
import "./VehicleScreens.css";

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
    const [vehicles, setVehicles] = useState(initialVehicles);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [activeScreen, setActiveScreen] = useState(null);
    const [vehicleToDelete, setVehicleToDelete] = useState(null);

    const handleBack = () => {
        setSelectedVehicle(null);
        setActiveScreen(null);
    };

    const handleCreate = () => {
        setSelectedVehicle(null);
        setActiveScreen({ type: "create" });
    };

    const handleEdit = (vehicle) => {
        setSelectedVehicle(vehicle);
        setActiveScreen({ type: "edit", vehicle });
    };

    const handleView = (vehicle) => {
        setActiveScreen({ type: "detail", vehicle });
    };

    // Mở popup xác nhận.
    const handleDelete = (vehicle) => {
        setVehicleToDelete(vehicle);
    };

    // Xóa sau khi xác nhận trong popup.
    const handleConfirmDelete = () => {
        if (!vehicleToDelete) return;

        setVehicles((prev) =>
            prev.filter((vehicle) => vehicle.id !== vehicleToDelete.id)
        );

        if (
            activeScreen?.type === "detail" &&
            activeScreen.vehicle.id === vehicleToDelete.id
        ) {
            handleBack();
        }

        setVehicleToDelete(null);
    };

    const handleSubmit = (formData) => {
        const timestamp = new Date().toISOString();

        if (selectedVehicle) {
            setVehicles((prev) =>
                prev.map((vehicle) =>
                    vehicle.id === selectedVehicle.id
                        ? {
                            ...vehicle,
                            ...formData,
                            updatedAt: timestamp,
                        }
                        : vehicle
                )
            );
        } else {
            setVehicles((prev) => {
                const nextId =
                    Math.max(
                        0,
                        ...prev.map(
                            (vehicle) =>
                                Number(vehicle.id.replace("XE-", "")) || 0
                        )
                    ) + 1;

                const newVehicle = {
                    ...formData,
                    id: `XE-${String(nextId).padStart(3, "0")}`,
                    createdAt: timestamp,
                    updatedAt: timestamp,
                };

                return [...prev, newVehicle];
            });
        }

        handleBack();
    };

    const handleReload = () => {
        setVehicles(initialVehicles);
    };

    let screen;

    if (activeScreen?.type === "detail") {
        screen = (
            <VehicleDetailScreen
                vehicle={activeScreen.vehicle}
                onBack={handleBack}
                onDelete={() => handleDelete(activeScreen.vehicle)}
            />
        );
    } else if (activeScreen?.type === "create") {
        screen = (
            <VehicleCreateScreen
                onCancel={handleBack}
                onSubmit={handleSubmit}
            />
        );
    } else if (activeScreen?.type === "edit") {
        screen = (
            <VehicleEditScreen
                vehicle={activeScreen.vehicle}
                onCancel={handleBack}
                onSubmit={handleSubmit}
            />
        );
    } else {
        screen = (
            <div className="vehicles-page">
                <PageHeader
                    title="Quản lý xe"
                    onReload={handleReload}
                    onCreate={handleCreate}
                    createLabel="Tạo xe"
                />

                <div className="vehicle-card">
                    <VehicleTable
                        vehicles={vehicles}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </div>
            </div>
        );
    }

    return (
        <>
            {screen}
            <DeleteConfirmModal
                open={vehicleToDelete !== null}
                itemName={`xe ${vehicleToDelete?.id ?? ""}`}
                onCancel={() => setVehicleToDelete(null)}
                onConfirm={handleConfirmDelete}
            />
        </>
    );
}