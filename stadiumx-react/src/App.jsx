
import { useEffect, useState } from 'react';
import { supabase } from './supabase';

function MatchCard({ match, onBooked }) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState('');

  async function handleBooking(e) {
    e.preventDefault();
    setMessage('');

    const tickets = Number(quantity);

    if (!name.trim()) {
      setMessage('Please enter your name.');
      return;
    }

    if (!Number.isInteger(tickets) || tickets < 1) {
      setMessage('Enter a valid ticket quantity.');
      return;
    }

    if (tickets > match.available_seats) {
      setMessage('Not enough seats available.');
      return;
    }

    setBooking(true);

    const oldSeats = match.available_seats;
    const newSeats = oldSeats - tickets;
    const totalPrice = tickets * match.price;

    // Update available seats in the database
    const { data: updatedMatch, error: updateError } =
      await supabase
        .from('matches')
        .update({ available_seats: newSeats })
        .eq('id', match.id)
        .gte('available_seats', tickets)
        .select('id')
        .maybeSingle();

    if (updateError || !updatedMatch) {
      setMessage(
        updateError
          ? updateError.message
          : 'Seats are no longer available. Please refresh.'
      );
      setBooking(false);
      return;
    }

    // Insert booking into the bookings table
    const { error: bookingError } = await supabase
      .from('bookings')
      .insert([
        {
          match_id: match.id,
          customer_name: name.trim(),
          tickets: tickets,
          total_price: totalPrice
        }
      ]);

    if (bookingError) {
      // Restore seats if booking insertion fails
      await supabase
        .from('matches')
        .update({ available_seats: oldSeats })
        .eq('id', match.id);

      setMessage(bookingError.message);
      setBooking(false);
      return;
    }

    setMessage('Booking successful!');
    setName('');
    setQuantity(1);
    setBooking(false);

    onBooked();
  }

  return (
    <div style={{
      border: '1px solid #ccc',
      padding: '20px',
      borderRadius: '12px',
      background: '#fff'
    }}>
      <h3>{match.team1} vs {match.team2}</h3>
      <p>Date: {match.date}</p>
      <p>Venue: {match.venue}</p>
      <p>Ticket Price: ₹{match.price}</p>

      <p>
        Available Seats: <strong>{match.available_seats}</strong>
      </p>

      <hr />

      <h4>Book Your Tickets</h4>

      <form onSubmit={handleBooking}>
        <label>Your Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          required
          style={{
            display: 'block',
            width: '100%',
            padding: '10px',
            margin: '8px 0'
          }}
        />

        <label>Number of Tickets</label>
        <input
          type="number"
          min="1"
          max={match.available_seats}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
          style={{
            display: 'block',
            width: '100%',
            padding: '10px',
            margin: '8px 0'
          }}
        />

        <p>
          Total: <strong>₹{Number(quantity) * match.price}</strong>
        </p>

        <button
          type="submit"
          disabled={booking || match.available_seats < 1}
          style={{
            background: '#102b49',
            color: 'white',
            padding: '12px 20px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          {booking ? 'Booking...' : 'Book Tickets'}
        </button>
      </form>

      {message && (
        <p style={{
          color: message === 'Booking successful!' ? 'green' : 'red',
          fontWeight: 'bold'
        }}>
          {message}
        </p>
      )}
    </div>
  );
}

function App() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function fetchMatches() {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      setError(error.message);
    } else {
      setMatches(data);
      setError('');
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchMatches();

    const channel = supabase
      .channel('matches-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches'
        },
        () => {
          fetchMatches();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div style={{
      padding: '30px',
      fontFamily: 'Arial',
      background: '#f4f6f9',
      minHeight: '100vh'
    }}>
      <h1>StadiumX - IPL Ticket Booking</h1>
      <h2>Live Matches from Supabase</h2>

      {loading && <p>Loading matches...</p>}

      {error && (
        <p style={{ color: 'red' }}>Error: {error}</p>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        {matches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            onBooked={fetchMatches}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
