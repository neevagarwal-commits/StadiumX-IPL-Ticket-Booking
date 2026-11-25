
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import MatchCard from "./components/MatchCard";
import "./App.css";

function App() {

  const matches = [
    {
      id: 1,
      team1: "RCB",
      team2: "CSK",
      date: "10 April 2026",
      venue: "Bengaluru",
      price: 800
    },
    {
      id: 2,
      team1: "MI",
      team2: "KKR",
      date: "11 April 2026",
      venue: "Mumbai",
      price: 1000
    },
    {
      id: 3,
      team1: "CSK",
      team2: "SRH",
      date: "12 April 2026",
      venue: "Chennai",
      price: 700
    }
  ];

  return (
    <>
      <Navbar />
      <Hero />

      <section className="matches" id="matches">
        <h1>Upcoming IPL Matches</h1>

        <div className="match-container">
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              team1={match.team1}
              team2={match.team2}
              date={match.date}
              venue={match.venue}
              price={match.price}
            />
          ))}
        </div>
      </section>
    </>
  );
}

export default App;
