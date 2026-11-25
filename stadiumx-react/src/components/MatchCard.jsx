
import { useState } from "react";

function MatchCard(props) {
  const [booked, setBooked] = useState(false);

  return (
    <div className="match-card">
      <h2>{props.team1} vs {props.team2}</h2>
      <p>📅 {props.date}</p>
      <p>📍 {props.venue}</p>
      <h3>Starting from ₹{props.price}</h3>

      <button onClick={() => setBooked(!booked)}>
        {booked ? "Booking Selected ✓" : "Book Tickets"}
      </button>
    </div>
  );
}

export default MatchCard;
