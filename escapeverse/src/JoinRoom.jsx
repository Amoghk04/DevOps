import { useState } from "react";
import { useNavigate } from "react-router-dom";

function JoinRoom() {
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleJoin = () => {
    if (roomCode.trim()) {
      // When joining via code, we pass a specific theme parameter (should match host's theme)
      navigate(`/room/${roomCode}?theme=tech`);
    } else {
      setError("Please enter a valid room code");
    }
  };

  return (
    <div className="bg-black/60 p-6 rounded-lg w-full max-w-md text-white">
      <h2 className="text-xl font-bold mb-4 text-yellow-300">Join a Room</h2>
      
      {error && (
        <div className="bg-red-500/50 p-2 rounded mb-4 text-white">
          {error}
        </div>
      )}
      
      <input
        type="text"
        placeholder="Enter Room Code"
        value={roomCode}
        onChange={(e) => {
          setRoomCode(e.target.value);
          setError("");
        }}
        className="w-full p-2 rounded mb-4 text-black"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleJoin();
          }
        }}
      />
      
      <button
        onClick={handleJoin}
        className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded transition-colors"
      >
        Join Room
      </button>
    </div>
  );
}

export default JoinRoom;