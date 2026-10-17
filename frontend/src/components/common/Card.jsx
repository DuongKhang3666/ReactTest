import "./common.css";

export default function Card({
                                 children,
                                 className = "",
                                 padding = "20px",
                                 style = {},
                                 ...props
                             }) {
    return (
        <div
            className={`common-card ${className}`}
            style={{ padding, ...style }}
            {...props}
        >
            {children}
        </div>
    );
}