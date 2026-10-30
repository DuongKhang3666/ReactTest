import {unavailable, selectedBox, armchair} from "../../assets";

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
