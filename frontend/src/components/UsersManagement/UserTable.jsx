import UserRow from "./UserRow";

export default function UserTable({ users, onView, onRoleChange }) {
    return (
        <div className="users-table-wrapper">
            <table className="users-table" aria-label="Danh sách người dùng">
                <colgroup>
                    <col className="users-column-id" />
                    <col className="users-column-username" />
                    <col className="users-column-email" />
                    <col className="users-column-name" />
                    <col className="users-column-phone" />
                    <col className="users-column-role" />
                    <col className="users-column-actions" />
                </colgroup>
                <thead>
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">TÊN ĐĂNG NHẬP</th>
                        <th scope="col">EMAIL</th>
                        <th scope="col">HỌ TÊN</th>
                        <th scope="col">ĐIỆN THOẠI</th>
                        <th scope="col">VAI TRÒ</th>
                        <th scope="col">THAO TÁC</th>
                    </tr>
                </thead>
                <tbody>
                    {users.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="users-empty">
                                Chưa có người dùng nào
                            </td>
                        </tr>
                    ) : (
                        users.map((user) => (
                            <UserRow
                                key={user.id}
                                user={user}
                                onView={onView}
                                onRoleChange={onRoleChange}
                            />
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
