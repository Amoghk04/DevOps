import { useUser } from "./UserContext";
import { X } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfileOverlay({ onClose }) {
  const { user } = useUser();
  motion;
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ rotateY: 90, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        exit={{ rotateY: -90, opacity: 0 }}
        transition={{ type: "spring", stiffness: 80, damping: 12 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md relative"
        style={{ transformStyle: "preserve-3d" }}
      >
        <button 
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
          onClick={onClose}
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-300">Your Profile</h2>
        <div className="space-y-2">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-white">{user?.displayName || "Anonymous"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-white">{user?.email || "No email"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">User ID</p>
            <p className="text-xs text-gray-600 break-all dark:text-gray-300">{user?.uid}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
