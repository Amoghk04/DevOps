import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001"); // adjust to your backend

function RoomLobby() {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const theme = searchParams.get("theme");
  const [players, setPlayers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    socket.emit("join-room", { roomId });

    socket.on("room-players", (playerList) => {
      setPlayers(playerList);
    });

    socket.on("start-game", () => {
      navigate(`/game/${roomId}?theme=${theme}`);
    });

    return () => {
      socket.emit("leave-room", roomId);
      socket.off("room-players");
      socket.off("start-game");
    };
  }, [roomId, theme, navigate]);

  const handleStartGame = () => {
    socket.emit("start-game", { roomId });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white p-10 bg-black/70">
      <h1 className="text-3xl font-bold mb-4">Room: {roomId}</h1>
      <h2 className="text-xl mb-2">Theme: {theme}</h2>
      <ul className="mb-6">
        {players.map((p, idx) => (
          <li key={idx}>{p.username}</li>
        ))}
      </ul>
      <button
        onClick={handleStartGame}
        className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700"
      >
        Start Game
      </button>
    </div>
  );
}

export default RoomLobby;
