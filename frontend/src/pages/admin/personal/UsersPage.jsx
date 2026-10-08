import { useState } from "react";
import PageHeader from "../../../components/common/PageHeader";
import UserTable from "../../../components/UsersManagement/UserTable";
import UserDetailScreen from "./UserDetailScreen";
import "./UsersPage.css";

const initialUsers = [
    {
        id: "ND-001",
        username: "minhanh",
        email: "minhanh@example.com",
        fullName: "Nguyễn Minh Anh",
        phone: "0901 234 567",
        role: "CUSTOMER",
    },
    {
        id: "ND-002",
        username: "hoangnam",
        email: "hoangnam@example.com",
        fullName: "Trần Hoàng Nam",
        phone: "0912 345 678",
        role: "CUSTOMER",
    },
    {
        id: "ND-003",
        username: "admin01",
        email: "admin@vexanh.vn",
        fullName: "Lê Ngọc Hà",
        phone: "0988 123 456",
        role: "ADMIN",
    },
    {
        id: "ND-004",
        username: "thuyduong",
        email: "thuyduong@example.com",
        fullName: "Chưa có thông tin",
        phone: "Chưa có thông tin",
        role: "CUSTOMER",
    },
    {
        id: "ND-005",
        username: "quocbao",
        email: "bao.q@example.com",
        fullName: "Phạm Quốc Bảo",
        phone: "0933 456 789",
        role: "CUSTOMER",
    },
];

export default function UsersPage() {
    const [users, setUsers] = useState(initialUsers);
    const [viewedUserId, setViewedUserId] = useState(null);
    const viewedUser = users.find((user) => user.id === viewedUserId) ?? null;

    const handleRoleChange = (userId, role) => {
        setUsers((current) =>
            current.map((user) =>
                user.id === userId ? { ...user, role } : user
            )
        );
    };

    return (
        <div className="users-page">
            <PageHeader
                title="Quản lý người dùng"
                onReload={() => setUsers(initialUsers)}
                showCreate={false}
            />
            <div className="users-card">
                <UserTable
                    users={users}
                    onView={(user) => setViewedUserId(user.id)}
                    onRoleChange={handleRoleChange}
                />
            </div>
            <UserDetailScreen
                user={viewedUser}
                onClose={() => setViewedUserId(null)}
            />
        </div>
    );
}
