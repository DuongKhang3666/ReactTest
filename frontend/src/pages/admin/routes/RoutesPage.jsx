import { useState } from "react";
import PageHeader from "../../../components/common/PageHeader";
import DeleteConfirmModal from "../../../components/common/DeleteConfirmModal";
import RouteTable from "../../../components/routes/RouteTable";
import RouteCreateScreen from "./RouteCreateScreen";
import RouteDetailScreen from "./RouteDetailScreen";
import RouteEditScreen from "./RouteEditScreen";
import "./RouteScreens.css";

const initialRoutes = [
    {
        id: "T-001",
        departureCity: "TP. Hồ Chí Minh",
        destinationCity: "Đà Lạt",
        departureStation: "Bến xe Miền Đông",
        arrivalStation: "Bến xe Đà Lạt",
        distanceKm: 305,
        durationMinutes: 420,
        active: true,
    },
    {
        id: "T-002",
        departureCity: "Hà Nội",
        destinationCity: "Hải Phòng",
        departureStation: "Bến xe Nước Ngầm",
        arrivalStation: "Bến xe Vĩnh Niệm",
        distanceKm: 120,
        durationMinutes: 150,
        active: true,
    },
    {
        id: "T-003",
        departureCity: "Đà Nẵng",
        destinationCity: "Huế",
        departureStation: "Bến xe Trung tâm",
        arrivalStation: "Bến xe Phía Nam",
        distanceKm: 102,
        durationMinutes: 135,
        active: true,
    },
    {
        id: "T-004",
        departureCity: "Cần Thơ",
        destinationCity: "Cà Mau",
        departureStation: "Bến xe Cần Thơ",
        arrivalStation: "Bến xe Cà Mau",
        distanceKm: 180,
        durationMinutes: 240,
        active: false,
    },
];

export default function RoutesPage() {
    const [routes, setRoutes] = useState(initialRoutes);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [activeScreen, setActiveScreen] = useState(null);
    const [routeToDelete, setRouteToDelete] = useState(null);

    const handleBack = () => {
        setSelectedRoute(null);
        setActiveScreen(null);
    };

    const handleCreate = () => {
        setSelectedRoute(null);
        setActiveScreen({ type: "create" });
    };

    const handleView = (route) => {
        setActiveScreen({ type: "detail", route });
    };

    const handleEdit = (route) => {
        setSelectedRoute(route);
        setActiveScreen({ type: "edit", route });
    };

    const handleDelete = (route) => {
        setRouteToDelete(route);
    };

    const handleConfirmDelete = () => {
        if (!routeToDelete) return;

        setRoutes((current) =>
            current.filter((route) => route.id !== routeToDelete.id)
        );

        if (
            activeScreen?.type === "detail" &&
            activeScreen.route.id === routeToDelete.id
        ) {
            handleBack();
        }

        setRouteToDelete(null);
    };

    const handleSubmit = (formData) => {
        if (selectedRoute) {
            setRoutes((current) =>
                current.map((route) =>
                    route.id === selectedRoute.id
                        ? { ...route, ...formData }
                        : route
                )
            );
        } else {
            setRoutes((current) => {
                const nextId = Math.max(
                    0,
                    ...current.map((route) => Number(route.id.replace("T-", "")) || 0)
                ) + 1;

                return [
                    ...current,
                    {
                        ...formData,
                        id: `T-${String(nextId).padStart(3, "0")}`,
                    },
                ];
            });
        }

        handleBack();
    };

    const handleReload = () => {
        setRoutes(initialRoutes);
    };

    let screen;

    if (activeScreen?.type === "detail") {
        screen = (
            <RouteDetailScreen
                route={activeScreen.route}
                onBack={handleBack}
                onDelete={() => handleDelete(activeScreen.route)}
            />
        );
    } else if (activeScreen?.type === "create") {
        screen = (
            <RouteCreateScreen
                onCancel={handleBack}
                onSubmit={handleSubmit}
            />
        );
    } else if (activeScreen?.type === "edit") {
        screen = (
            <RouteEditScreen
                route={activeScreen.route}
                onCancel={handleBack}
                onSubmit={handleSubmit}
            />
        );
    } else {
        screen = (
            <div className="routes-page">
                <PageHeader
                    title="Quản lý tuyến đường"
                    onReload={handleReload}
                    onCreate={handleCreate}
                    createLabel="Tạo tuyến"
                />
                <div className="route-card">
                    <RouteTable
                        routes={routes}
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
                open={routeToDelete !== null}
                itemName={`tuyến ${routeToDelete?.id ?? ""}`}
                onCancel={() => setRouteToDelete(null)}
                onConfirm={handleConfirmDelete}
            />
        </>
    );
}
