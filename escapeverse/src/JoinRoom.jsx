import { useState } from "react";
import { useNavigate } from "react-router-dom";

function JoinRoom() {
  const [roomCode, setRoomCode] = useState("");
  const navigate = useNavigate();

  const handleJoin = () => {
    if (roomCode.trim()) {
      navigate(`/room/${roomCode}?theme=${theme}`);
    }
  };

  return (
    <div className="bg-black/60 p-6 rounded-lg w-full max-w-md text-white">
      <h2 className="text-xl font-bold mb-4 text-yellow-300">Join a Room</h2>
      <input
        type="text"
        placeholder="Enter Room Code"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value)}
        className="w-full p-2 rounded mb-4 text-black"
      />
      <button
        onClick={handleJoin}
        className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded"
      >
        Join Room
      </button>
    </div>
  );
}

export default JoinRoom;
