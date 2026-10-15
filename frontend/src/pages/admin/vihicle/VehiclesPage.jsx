import { useState } from "react";
import PageHeader from "../../../components/common/PageHeader";
import VehicleTable from "../../../components/vehicles/VehicleTable";
import VehicleDetailScreen from "./VehicleDetailScreen";
import VehicleCreateScreen from "./VehicleCreateScreen";
import VehicleEditScreen from "./VehicleEditScreen";
import DeleteConfirmModal from "../../../components/common/DeleteConfirmModal";
import { useBuses, useCreateBus, useDeleteBus, useUpdateBus } from "../../../hooks/useBuses";
import "./VehicleScreens.css";

function toVehicle(bus) {
    return {
        ...bus,
        plate: bus.licensePlate,
        type: bus.busType,
        seats: bus.seatCount,
        active: bus.status === "ACTIVE",
    };
}

function toBusPayload(formData) {
    return {
        licensePlate: formData.plate,
        busType: formData.type,
        seatCount: formData.seats,
        description: formData.description,
        status: formData.active ? "ACTIVE" : "INACTIVE",
    };
}

export default function VehiclesPage() {
    const busesQuery = useBuses();
    const createMutation = useCreateBus();
    const deleteMutation = useDeleteBus();
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [activeScreen, setActiveScreen] = useState(null);
    const [vehicleToDelete, setVehicleToDelete] = useState(null);
    const updateMutation = useUpdateBus(
        activeScreen?.type === "edit" ? activeScreen.vehicle.id : null,
    );

    const handleBack = () => {
        createMutation.reset();
        updateMutation.reset();
        deleteMutation.reset();
        
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

    const handleView = (vehicle) => setActiveScreen({ type: "detail", vehicle });
    const handleDelete = (vehicle) => setVehicleToDelete(vehicle);

    const handleConfirmDelete = () => {
        if (!vehicleToDelete) return;
        deleteMutation.mutate(vehicleToDelete.id, {
            onSuccess: () => {
                if (
                    activeScreen?.type === "detail" &&
                    activeScreen.vehicle.id === vehicleToDelete.id
                ) {
                    handleBack();
                }
                setVehicleToDelete(null);
            },
        });
    };

    const handleSubmit = (formData) => {
        const payload = toBusPayload(formData);
        const mutation = selectedVehicle ? updateMutation : createMutation;
        mutation.mutate(payload, { onSuccess: handleBack });
    };

    if (busesQuery.isPending) return <p role="status">Đang tải danh sách xe...</p>;

    if (busesQuery.isError) {
        return (
            <section className="vehicles-page">
                <p role="alert">Không thể tải danh sách xe: {busesQuery.error.message}</p>
                <button type="button" onClick={() => busesQuery.refetch()}>Thử lại</button>
            </section>
        );
    }

    const vehicles = busesQuery.data.map(toVehicle);
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
        screen = <VehicleCreateScreen onCancel={handleBack} onSubmit={handleSubmit} />;
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
                    onReload={() => busesQuery.refetch()}
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

    const mutationError = createMutation.error ?? updateMutation.error ?? deleteMutation.error;

    return (
        <>
            {screen}
            {mutationError && (
                <p role="alert"> Thao tác thất bại:{" "}
                    {mutationError.response?.data?.message ||
                    mutationError.message || "Đã xảy ra lỗi, vui lòng thử lại."}
                </p>
            )}
            <DeleteConfirmModal
                open={vehicleToDelete !== null}
                itemName={`xe ${vehicleToDelete?.id ?? ""}`}
                onCancel={() => setVehicleToDelete(null)}
                onConfirm={handleConfirmDelete}
            />
        </>
    );
}
