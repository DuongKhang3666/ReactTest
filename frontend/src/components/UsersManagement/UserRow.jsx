import eyes from "../../assets/eyes.png";
import UserRoleBadge from "./UserRoleBadge";

const roles = ["CUSTOMER", "ADMIN"];

export default function UserRow({ user, onView, onRoleChange }) {
    return (
        <tr>
            <td>{user.id}</td>
            <td>{user.username}</td>
            <td>{user.email}</td>
            <td>{user.fullName}</td>
            <td>{user.phone}</td>
            <td>
                <UserRoleBadge role={user.role} />
            </td>
            <td className="user-actions-cell">
                <div className="user-row-actions">
                    <button
                        type="button"
                        className="user-view-button"
                        aria-label={`Xem người dùng ${user.username}`}
                        onClick={() => onView(user)}
                    >
                        <img src={eyes} alt="" />
                        Xem
                    </button>
                    <details className="user-role-menu">
                        <summary aria-label={`Đổi vai trò cho ${user.username}`}>
                            Đổi vai trò
                        </summary>
                        <div className="user-role-options" role="group" aria-label="Chọn vai trò">
                            {roles.map((role) => (
                                <button
                                    key={role}
                                    type="button"
                                    className={user.role === role ? "user-role-option-current" : ""}
                                    aria-pressed={user.role === role}
                                    onClick={(event) => {
                                        onRoleChange(user.id, role);
                                        event.currentTarget.closest("details").open = false;
                                    }}
                                >
                                    {role}
                                    {user.role === role && <span aria-hidden="true">✓</span>}
                                </button>
                            ))}
                        </div>
                    </details>
                </div>
            </td>
        </tr>
    );
}