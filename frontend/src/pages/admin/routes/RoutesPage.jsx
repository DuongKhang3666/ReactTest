import { useState } from "react";
import PageHeader from "../../../components/common/PageHeader";
import DeleteConfirmModal from "../../../components/common/DeleteConfirmModal";
import RouteTable from "../../../components/routes/RouteTable";
import RouteCreateScreen from "./RouteCreateScreen";
import RouteDetailScreen from "./RouteDetailScreen";
import RouteEditScreen from "./RouteEditScreen";
import { useCreateRoute, useDeleteRoute, useRoutes, useUpdateRoute } from "../../../hooks/useRoutes";
import "./RouteScreens.css";

function toRouteView(route) {
    return {
        ...route,
        arrivalStation: route.destinationStation,
        active: route.status === "ACTIVE",
    };
}

function toRoutePayload(formData) {
    return {
        departureCity: formData.departureCity,
        destinationCity: formData.destinationCity,
        departureStation: formData.departureStation,
        destinationStation: formData.arrivalStation,
        distanceKm: formData.distanceKm,
        durationMinutes: formData.durationMinutes,
        status: formData.active ? "ACTIVE" : "INACTIVE",
    };
}

export default function RoutesPage() {
    const routesQuery = useRoutes();
    const createMutation = useCreateRoute();
    const deleteMutation = useDeleteRoute();
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [activeScreen, setActiveScreen] = useState(null);
    const [routeToDelete, setRouteToDelete] = useState(null);
    const updateMutation = useUpdateRoute(
        activeScreen?.type === "edit" ? activeScreen.route.id : null,
    );

    const handleBack = () => {
        createMutation.reset();
        updateMutation.reset();
        deleteMutation.reset();
        
        setSelectedRoute(null);
        setActiveScreen(null);
    };

    const handleCreate = () => {
        setSelectedRoute(null);
        setActiveScreen({ type: "create" });
    };

    const handleView = (route) => setActiveScreen({ type: "detail", route });

    const handleEdit = (route) => {
        setSelectedRoute(route);
        setActiveScreen({ type: "edit", route });
    };

    const handleDelete = (route) => setRouteToDelete(route);

    const handleConfirmDelete = () => {
        if (!routeToDelete) return;
        deleteMutation.mutate(routeToDelete.id, {
            onSuccess: () => {
                if (
                    activeScreen?.type === "detail" &&
                    activeScreen.route.id === routeToDelete.id
                ) {
                    handleBack();
                }
                setRouteToDelete(null);
            },
        });
    };

    const handleSubmit = (formData) => {
        const payload = toRoutePayload(formData);
        const mutation = selectedRoute ? updateMutation : createMutation;
        mutation.mutate(payload, { onSuccess: handleBack });
    };

    if (routesQuery.isPending) return <p role="status">Đang tải danh sách tuyến...</p>;

    if (routesQuery.isError) {
        return (
            <section className="routes-page">
                <p role="alert">Không thể tải danh sách tuyến: {routesQuery.error.message}</p>
                <button type="button" onClick={() => routesQuery.refetch()}>Thử lại</button>
            </section>
        );
    }

    const routes = routesQuery.data.map(toRouteView);
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
        screen = <RouteCreateScreen onCancel={handleBack} onSubmit={handleSubmit} />;
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
                    onReload={() => routesQuery.refetch()}
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
                open={routeToDelete !== null}
                itemName={`tuyến ${routeToDelete?.id ?? ""}`}
                onCancel={() => setRouteToDelete(null)}
                onConfirm={handleConfirmDelete}
            />
        </>
    );
}
