import { useEffect, useState, useContext, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { UserContext } from "./UserContext"; // Import your UserContext
import { useGame } from "./rooms/GameProvider";

function RoomLobby() {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  // Get the actual theme value - this should be specific (tech, mystery, horror)
  const theme = searchParams.get("theme") || "tech"; // Default to "tech" if not provided
  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [hostId, setHostId] = useState(null);
  const { user } = useContext(UserContext); // Access the user from context
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const joinedRef = useRef(false);
  const { playBackgroundMusic } = useGame(); // Access the playBackgroundMusic function from GameProvider

  useEffect(() => {
    console.log("Room Lobby rendered. Path:", window.location.pathname);
    console.log("Search params:", Object.fromEntries([...searchParams]));
    console.log("Local storage host:", localStorage.getItem("isRoomHost"));
    console.log("Local storage room ID:", localStorage.getItem("roomHostId"));

    // Create socket connection inside the component
    socketRef.current = io("http://localhost:3001");

    // Set up event listeners first before joining
    socketRef.current.on("room-players", (data) => {
      console.log("Updated player list:", data);
      // Make sure we're handling both the old format (array only) and new format (object with players and hostId)
      if (Array.isArray(data)) {
        setPlayers(data);
      } else if (data && data.players) {
        setPlayers(data.players);
        setHostId(data.hostId);

        // Check if current user is the host
        if (data.hostId === socketRef.current.id) {
          setIsHost(true);
        }
      }
    });

    socketRef.current.on("start-game", (gameData) => {
      const gameTheme = gameData?.theme || theme;
      console.log("Received start-game event, navigating to:", `/game/${roomId}/${gameTheme}`);
      navigate(`/game/${roomId}/${gameTheme}`);
    });

    socketRef.current.on("host-status", (isUserHost) => {
      console.log("Host status received:", isUserHost);
      setIsHost(isUserHost);
    });

    // Join the room if we have user info and haven't joined yet
    if (user && !joinedRef.current) {
      console.log("Joining room as:", user.displayName);

      // Check if user is creator - either from URL or localStorage
      const isCreator = searchParams.has("creator") ||
        (localStorage.getItem("isRoomHost") === "true" &&
          localStorage.getItem("roomHostId") === roomId);

      console.log("Is creator?", isCreator);

      socketRef.current.emit("join-room", {
        roomId,
        username: user.displayName,
        isCreator: isCreator
      });

      joinedRef.current = true;

      // If we are the creator, we know we're the host
      if (isCreator) {
        setIsHost(true);
      }

      // Clear localStorage if we're not the host of this particular room
      if (localStorage.getItem("roomHostId") !== roomId) {
        localStorage.removeItem("isRoomHost");
        localStorage.removeItem("roomHostId");
      }
    }

    // Clean up function
    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leave-room", roomId);
        socketRef.current.disconnect();
      }
      joinedRef.current = false;
    };
  }, [roomId, theme, navigate, user, searchParams]);

  const handleStartGame = () => {
    console.log("Attempting to start game. Is host:", isHost);
    if (isHost) {
      socketRef.current.emit("start-game", { roomId, theme });
    }
    playBackgroundMusic(); // Play background music when starting the game
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomId).then(() => {
      alert("Room code copied to clipboard!");
    }).catch((err) => {
      console.error("Failed to copy room code:", err);
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white p-10 bg-black/70">
      <h1 className="text-3xl font-bold mb-4">Room: {roomId}</h1>
      <h2 className="text-xl mb-2">Theme: {theme}</h2>

      {/* Display room code for sharing */}
      <div className="mb-6 text-center">
        <h3 className="text-xl font-semibold">Room Code:</h3>
        <p className="text-2xl font-mono bg-gray-800 px-4 py-2 rounded">{roomId}</p>
        <p className="text-sm mt-2">Share this code with friends to join!</p>
        <button
          onClick={copyRoomCode}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
        >
          Copy Room Code
        </button>
      </div>

      {/* Display the players list */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold">Players in the Room:</h3>
        <ul className="mt-2">
          {players && players.length > 0 ? (
            players.map((p, idx) => (
              <li key={idx} className="text-lg">
                {p.username || "Anonymous Player"}
                {p.id === socketRef.current?.id ? " (You)" : ""}
                {p.id === hostId ? " (Host)" : ""}
              </li>
            ))
          ) : (
            <li className="text-lg">Waiting for players...</li>
          )}
        </ul>
      </div>

      {isHost ? (
        <button
          onClick={handleStartGame}
          className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-all"
        >
          Start Game
        </button>
      ) : (
        <div className="px-6 py-3 bg-gray-700 rounded-lg text-center">
          Waiting for host to start the game...
        </div>
      )}
    </div>
  );
}

export default RoomLobby;