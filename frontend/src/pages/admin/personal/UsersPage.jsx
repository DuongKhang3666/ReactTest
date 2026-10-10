import { useState } from "react";
import PageHeader from "../../../components/common/PageHeader";
import UserTable from "../../../components/UsersManagement/UserTable";
import UserDetailScreen from "./UserDetailScreen";
import { useUpdateUserRole, useUsers } from "../../../hooks/useUsers";
import "./UsersPage.css";

export default function UsersPage() {
    const usersQuery = useUsers();
    const updateRoleMutation = useUpdateUserRole();
    const [viewedUserId, setViewedUserId] = useState(null);
    const users = usersQuery.data ?? [];
    const viewedUser = users.find((user) => user.id === viewedUserId) ?? null;

    if (usersQuery.isPending) return <p role="status">Đang tải danh sách người dùng...</p>;

    if (usersQuery.isError) {
        return (
            <section className="users-page">
                <p role="alert">Không thể tải danh sách người dùng: {usersQuery.error.message}</p>
                <button type="button" onClick={() => usersQuery.refetch()}>Thử lại</button>
            </section>
        );
    }

    return (
        <div className="users-page">
            <PageHeader
                title="Quản lý người dùng"
                onReload={() => usersQuery.refetch()}
                showCreate={false}
            />
            {updateRoleMutation.isError && (
                <p role="alert">Cập nhật vai trò thất bại: {updateRoleMutation.error.message}</p>
            )}
            <div className="users-card">
                <UserTable
                    users={users}
                    onView={(user) => setViewedUserId(user.id)}
                    onRoleChange={(userId, role) =>
                        updateRoleMutation.mutate({ userId, role })
                    }
                />
            </div>
            <UserDetailScreen
                user={viewedUser}
                onClose={() => setViewedUserId(null)}
            />
        </div>
    );
}
