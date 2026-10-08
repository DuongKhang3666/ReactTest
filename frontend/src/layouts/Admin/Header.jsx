import pro5 from "../../assets/ic_profile_circle.svg";

export default function Header() {
    return (
        <header className="header">
            <img src={pro5} alt="avt" className="avt"/>
            <h1>Tên Admin</h1>
        </header>
    );
}
