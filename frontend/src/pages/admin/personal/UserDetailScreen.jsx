import UserRoleBadge from "../../../components/UsersManagement/UserRoleBadge";

export default function UserDetailScreen({ user, onClose }) {
    if (!user) return null;

    return (
        <div className="user-dialog-backdrop" onMouseDown={onClose}>
            <section
                className="user-detail-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="user-detail-title"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <header className="user-detail-header">
                    <div>
                        <div className="user-detail-eyebrow">HỆ THỐNG ĐẶT VÉ XE</div>
                        <h2 id="user-detail-title">Thông tin người dùng</h2>
                    </div>
                    <button
                        type="button"
                        className="user-detail-close"
                        aria-label="Đóng"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </header>
                <dl className="user-detail-grid">
                    <div><dt>ID</dt><dd>{user.id}</dd></div>
                    <div><dt>Tên đăng nhập</dt><dd>{user.username}</dd></div>
                    <div><dt>Email</dt><dd>{user.email}</dd></div>
                    <div><dt>Họ tên</dt><dd>{user.fullName}</dd></div>
                    <div><dt>Điện thoại</dt><dd>{user.phone}</dd></div>
                    <div><dt>Vai trò</dt><dd><UserRoleBadge role={user.role} /></dd></div>
                </dl>
                <footer className="user-detail-footer">
                    <button type="button" onClick={onClose}>Đóng</button>
                </footer>
            </section>
        </div>
    );
}
