
import Button from "./Button";
import "./common.css";

export default function PageHeader({
    title,
    subtitle = "HỆ THỐNG ĐẶT VÉ XE",
    onReload,
    onCreate,
    createLabel = "Tạo mới",
    showCreate = true,
}) {
    return (
        <div className="page-header app-page-header">
            {/* 2 Chữ trên tiêu đề */}
            <div className="page-header-info">
                <div className="page-header-subtitle">
                    {subtitle}
                </div>

                <h1 className="page-header-title">
                    {title}
                </h1>
            </div>

            {/* 2 nút hành động */}
            <div className="page-header-actions">
                <Button className="reload"
                    variant="outline"
                    onClick={onReload}
                >
                    Tải lại
                </Button>

                {showCreate && (
                    <Button
                        className="create"
                        variant="primary"
                        onClick={onCreate}
                    >
                        {createLabel}
                    </Button>
                )}
            </div>
        </div>
    );
}
