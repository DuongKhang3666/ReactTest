export default function UserRoleBadge({ role }) {
    const isAdmin = role === "ADMIN";

    return (
        <span className={`user-role-badge ${isAdmin ? "user-role-admin" : "user-role-customer"}`}>
            <span className="user-role-dot" />
            {isAdmin ? "Quản trị viên (ADMIN)" : "Khách hàng (CUSTOMER)"}
        </span>
    );
}
