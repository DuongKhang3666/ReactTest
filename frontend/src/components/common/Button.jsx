

export default function Button({ children, variant = "default", type = "button", onClick, className = "", icon,}) {
    return (
        <button
            type={type}
            className={`button app-button app-button-${variant} ${className}`}
            onClick={onClick}
        >
            {icon && <span className="button-icon">{icon}</span>}
            <span>{children}</span>
        </button>
    );
}
