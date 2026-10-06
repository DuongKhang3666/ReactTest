// import chair_color from "../../assets/chair_color.png";
import selectedBox from "../../assets/selected_box.png";
import unavailable from "../../assets/unavailable.png";
import armchair from "../../assets/armchair.png";

import "./SeatNote.css";

export default function SeatNote() {
    return (
        <article className="legend">
            <h3>Chú thích</h3>
            <div className="legend-item">
                <img src={unavailable} alt="" />
                <span>Không bán</span>
            </div>
            <div className="legend-item">
                <img src={selectedBox} alt="" />
                <span>Đang chọn</span>
            </div>
            <div className="legend-item">
                <img src={armchair} alt="" />
                <span>Ghế thường</span>
            </div>
        </article>
    );
}
