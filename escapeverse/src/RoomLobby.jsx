import { useEffect, useState, useContext, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { UserContext } from "./UserContext"; // Import your UserContext

function RoomLobby() {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const theme = searchParams.get("theme");
  const [players, setPlayers] = useState([]);
  const { user } = useContext(UserContext); // Access the user from context
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const joinedRef = useRef(false);

  useEffect(() => {
    // Create socket connection inside the component
    socketRef.current = io("http://localhost:3001");
    
    // Set up event listeners first before joining
    socketRef.current.on("room-players", (playerList) => {
      console.log("Updated player list:", playerList);
      setPlayers(playerList);
    });

    socketRef.current.on("start-game", () => {
      navigate(`/game/${roomId}?theme=${theme}`);
    });

    // Join the room if we have user info and haven't joined yet
    if (user && !joinedRef.current) {
      console.log("Joining room as:", user.displayName);
      socketRef.current.emit("join-room", { 
        roomId, 
        username: user.displayName 
      });
      joinedRef.current = true;
      
      // Also manually add ourselves to the players list for immediate feedback
      setPlayers([{
        id: socketRef.current.id,
        username: user.displayName || "You"
      }]);
    }

    // Clean up function
    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leave-room", roomId);
        socketRef.current.disconnect();
      }
      joinedRef.current = false;
    };
  }, [roomId, theme, navigate, user]);

  const handleStartGame = () => {
    socketRef.current.emit("start-game", { roomId });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white p-10 bg-black/70">
      <h1 className="text-3xl font-bold mb-4">Room: {roomId}</h1>
      <h2 className="text-xl mb-2">Theme: {theme}</h2>
      
      {/* Display the players list */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold">Players in the Room:</h3>
        <ul className="mt-2">
          {players.length > 0 ? (
            players.map((p, idx) => (
              <li key={idx} className="text-lg">
                {p.username || "Anonymous Player"} {p.id === socketRef.current?.id ? "(You)" : ""}
              </li>
            ))
          ) : (
            <li className="text-lg">Waiting for players...</li>
          )}
        </ul>
      </div>

      <button
        onClick={handleStartGame}
        className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700"
        disabled={players.length < 1}
      >
        Start Game
      </button>
    </div>
  );
}

export default RoomLobby;