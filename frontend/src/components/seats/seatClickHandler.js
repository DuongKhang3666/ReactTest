export function toggleSeatSelection(seat, setSelectedSeats) {
    if (seat.status !== "ACTIVE") return;

    setSelectedSeats((current) => {
        const exists = current.includes(seat.id);

        if (exists) {
            return current.filter((id) => id !== seat.id);
        }

        return [...current, seat.id];
    });
}
