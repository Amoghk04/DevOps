
import { useUser } from "./UserContext";
import { X } from "lucide-react";
import { motion } from "framer-motion";
motion
export default function ProfileOverlay({ onClose }) {
  const { user } = useUser();
  const username = localStorage.getItem("username") || user?.displayName || "Anonymous";
  const profileIndex = parseInt(localStorage.getItem("profileIndex") || "0");

  const getIconPosition = (index) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    return {
      x: `${col * 50}%`,
      y: `${row * 50}%`
    };
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ rotateY: 90, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        exit={{ rotateY: -90, opacity: 0 }}
        transition={{ type: "spring", stiffness: 80, damping: 12 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 w-full max-w-md relative"
        style={{ transformStyle: "preserve-3d" }}
      >
        <button 
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
          onClick={onClose}
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center mb-6">
          {/* Profile Icon */}
          <div className="w-64 h-64 rounded-full overflow-hidden relative mb-4">
            <div
              className="absolute w-full h-full bg-cover"
              style={{
                backgroundImage: "url('profile1.png')",
                backgroundSize: "300% 300%",
                backgroundPosition: `${getIconPosition(profileIndex).x} ${getIconPosition(profileIndex).y}`
              }}
              aria-label="Profile Icon"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Username</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-white">{username}</p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-white">
              {user?.email || "No email"}
            </p>
          </div>          

          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">User ID</p>
            <p className="text-xs font-mono text-gray-600 break-all dark:text-gray-300">{user?.uid}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
