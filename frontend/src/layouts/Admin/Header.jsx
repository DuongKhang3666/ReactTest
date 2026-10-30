import pro5 from "../../assets/ic_profile_circle.svg";
import { useAuth } from "../../hooks/useAuth";

export default function Header() {
    const { user } = useAuth();

    return (
        <header className="header">
            <img src={pro5} alt="avt" className="avt"/>
            <h1>{user?.fullName || user?.username || "Quản trị viên"}</h1>
        </header>
    );
}
