import { useEffect, useRef } from "react";

export default function DeleteConfirmModal({
    open,
    itemName,
    onCancel,
    onConfirm,
}) {
    const dialogRef = useRef(null);

    useEffect(() => {
        if (!open) return;

        const dialog = dialogRef.current;
        const previousFocus = document.activeElement;

        dialog.showModal();

        return () => {
            dialog.close();
            previousFocus?.focus();
        };
    }, [open]);

    return (
        <dialog
            ref={dialogRef}
            className="delete-modal"
            aria-labelledby="delete-modal-title"
            onCancel={(event) => {
                event.preventDefault();
                onCancel();
            }}
        >
            <div className="delete-modal-icon" aria-hidden="true">
                !
            </div>

            <h2 id="delete-modal-title">Xác nhận xóa</h2>

            <p>
                Bạn có chắc muốn xóa <strong>{itemName}</strong>?
            </p>

            <div className="delete-modal-actions">
                <button
                    type="button"
                    className="delete-modal-cancel"
                    onClick={onCancel}
                    autoFocus
                >
                    Hủy
                </button>

                <button
                    type="button"
                    className="delete-modal-confirm"
                    onClick={onConfirm}
                >
                    Xóa
                </button>
            </div>
        </dialog>
    );
}