import { useState, useEffect,  } from 'react';
import { ChevronLeft, ChevronRight, User } from 'lucide-react';
import googleLogo from "./assets/google.webp";
import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
} from "firebase/auth";
import { socket } from './socket';
import { useNavigate } from 'react-router-dom';


export default function IconCarousel() {
    // Total number of icons in the 3x3 grid

    const totalIcons = 9;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // Names for each icon (for accessibility and display)
    const iconNames = [
        "Ninja", "Pirate", "Zombie",
        "Mummy", "Ghost", "Gamer",
        "Woman", "Man", "Skeleton"
    ];

    // Image dimensions for the 3x3 grid
    const ICONS_PER_ROW = 3;

    // Calculate icon position in the sprite sheet
    const getIconPosition = (index) => {
        const row = Math.floor(index / ICONS_PER_ROW);
        const col = index % ICONS_PER_ROW;

        // Return percentage positions for background-position
        return {
            x: `${col * 50}%`,
            y: `${row * 50}%`
        };
    };

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalIcons - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev < totalIcons - 1 ? prev + 1 : 0));
    };

    // Get the previous and next indices, wrapping around if needed
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : totalIcons - 1;
    const nextIndex = currentIndex < totalIcons - 1 ? currentIndex + 1 : 0;

    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
    };

    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
        if (e.target.value !== password) {
            setError("Passwords do not match");
        } else {
            setError("");
        }
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // Emit login event for new users
            socket.emit("user-login", {
                uid: userCredential.user.uid,
                email: userCredential.user.email,
                displayName: username,
                profileIndex: currentIndex,
            });
            navigate('/home');

        } catch (err) {
            setError(err.message);
        }
    };

    const handleGoogleAuth = async () => {
        try {
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({
                prompt: 'select_account'
            });

            const result = await signInWithPopup(auth, provider);
            // Emit login event
            socket.emit("user-login", {
                uid: result.user.uid,
                email: result.user.email,
                displayName: username,
                profileIndex: currentIndex,
            });

            navigate('/home');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleGuestAuth = async () => {
        try {
            const result = await signInAnonymously(auth);
            // Emit login event for guest users
            socket.emit("user-login", {
                uid: result.user.uid,
                displayName: username,
                profileIndex: currentIndex,
            });
            navigate('/home');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white/70 rounded-lg shadow-md">
            {/* Icon carousel */}
            <div className="flex items-center justify-center gap-4 mb-8">
                {/* Previous button */}
                <button
                    onClick={goToPrevious}
                    className="p-2 rounded-full hover:bg-gray-400 transition-colors"
                    aria-label="Previous icon"
                >
                    <ChevronLeft size={24} />
                </button>

                {/* Icon display area */}
                <div className="flex items-center">
                    {/* Previous icon (smaller) */}
                    <div className="w-16 h-16 rounded-full overflow-hidden relative opacity-70 transition-all duration-300 transform -mr-2 ">
                        <div
                            className="absolute w-full h-full bg-cover"
                            style={{
                                backgroundImage: "url('profile1.png')",
                                backgroundSize: "300% 300%",
                                backgroundPosition: `${getIconPosition(prevIndex).x} ${getIconPosition(prevIndex).y}`
                            }}
                            aria-label={iconNames[prevIndex]}
                        />
                    </div>

                    {/* Current icon (larger, focused) */}
                    <div className="w-32 h-32 rounded-full overflow-hidden relative z-10">
                        <div
                            className="absolute w-full h-full bg-cover"
                            style={{
                                backgroundImage: "url('profile1.png')",
                                backgroundSize: "300% 300%",
                                backgroundPosition: `${getIconPosition(currentIndex).x} ${getIconPosition(currentIndex).y}`
                            }}
                            aria-label={iconNames[currentIndex]}
                        />
                    </div>

                    {/* Next icon (smaller) */}
                    <div className="w-16 h-16 rounded-full overflow-hidden relative opacity-70 transition-all duration-300 transform -ml-2">
                        <div
                            className="absolute w-full h-full bg-cover"
                            style={{
                                backgroundImage: "url('profile1.png')",
                                backgroundSize: "300% 300%",
                                backgroundPosition: `${getIconPosition(nextIndex).x} ${getIconPosition(nextIndex).y}`
                            }}
                            aria-label={iconNames[nextIndex]}
                        />
                    </div>
                </div>

                {/* Next button */}
                <button
                    onClick={goToNext}
                    className="p-2 rounded-full hover:bg-gray-400 transition-colors"
                    aria-label="Next icon"
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            {/* Username section */}
            <div className="mb-6">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User size={18} className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        id="username"
                        className="bg-gray-900 border border-gray-700 text-white pl-10 py-2 rounded-lg w-full "
                        placeholder="Enter your username"
                        value={username}
                        onChange={handleUsernameChange}
                    />
                </div>
            </div>

            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 mb-4 rounded-md bg-white text-black"
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 mb-4 rounded-md bg-white text-black"
            />

            <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className="w-full p-2 mb-4 rounded-md bg-white text-black"
            />
            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

            <button
                onClick={handleAuth}
                className="w-full py-2 px-4 mb-4 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                {"Sign Up"}
            </button>


            <div className="flex gap-4">
                <button
                    onClick={handleGoogleAuth}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                    <img src={googleLogo} alt="Google" className="w-5 h-5" />
                    <span className="text-sm text-gray-700 dark:text-gray-200">
                        Sign up with Google
                    </span>
                </button>

                <button
                    onClick={handleGuestAuth}
                    className="flex-1 py-2 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                >
                    Continue as Guest
                </button>
            </div>

        </div>

    );
}