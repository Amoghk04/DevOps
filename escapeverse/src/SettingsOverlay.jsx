import { X, ChevronLeft, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUser } from "./UserContext";
import { auth } from "./firebase"; // Add this import at the top
import config from './config';

const SettingsOverlay = ({ onClose }) => {
    const [username, setUsername] = useState(localStorage.getItem('username') || '');
    const [email, setEmail] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');
    const { user } = useUser();
    const [currentIndex, setCurrentIndex] = useState(parseInt(localStorage.getItem('profileIndex')) || 0);

    // Profile carousel constants
    const totalIcons = 9;
    const ICONS_PER_ROW = 3;
    const iconNames = [
        "Ninja", "Pirate", "Zombie",
        "Mummy", "Ghost", "Gamer",
        "Woman", "Man", "Skeleton"
    ];

    // Add after other state declarations
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : totalIcons - 1;
    const nextIndex = currentIndex < totalIcons - 1 ? currentIndex + 1 : 0;

    const getIconPosition = (index) => {
        const row = Math.floor(index / ICONS_PER_ROW);
        const col = index % ICONS_PER_ROW;
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

    useEffect(() => {
        const userEmail = user?.email || "No email";
        setEmail(userEmail);
    }, [user]);

    const handleProfileUpdate = async () => {
        try {
            const response = await fetch(`${config.apiUrl}:3001/api/update-profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    newUsername: username,
                    newProfileIndex: currentIndex,
                }),
            });

            const data = await response.json();
            if (data.success) {
                localStorage.setItem('username', username);
                localStorage.setItem('profileIndex', currentIndex.toString());
                setIsEditing(false);
                setError('');
            } else {
                setError('Failed to update profile');
            }
        } catch (err) {
            setError('Error updating profile');
            console.error(err);
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            try {
                const response = await fetch(`${config.apiUrl}:3001/api/delete-account`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email }),
                });

                const data = await response.json();
                if (data.success) {
                    // Sign out from Firebase first
                    await auth.signOut();
                    // Then clear localStorage
                    localStorage.clear();
                    // Finally navigate
                    window.location.href = '/'; // Using window.location.href to force a full page refresh
                } else {
                    setError('Failed to delete account');
                }
            } catch (err) {
                setError('Error deleting account');
                console.error(err);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-4xl w-full mx-4 relative">
                {/* Close button */}
                <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </button>

                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Account Settings</h2>

                <div className="flex gap-8">
                    {/* Left Column - Profile Picture */}
                    <div className="w-1/2 border-r border-gray-200 dark:border-gray-700 pr-8">
                        <div className="mb-12"></div>
                        <div className="flex flex-col items-center">
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
                                    <div className="w-20 h-20 rounded-full overflow-hidden relative opacity-70 transition-all duration-300 transform -mr-2">
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

                                    {/* Current icon (larger) */}
                                    <div className="w-40 h-40 rounded-full overflow-hidden relative z-10">
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
                                    <div className="w-20 h-20 rounded-full overflow-hidden relative opacity-70 transition-all duration-300 transform -ml-2">
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

                            
                        </div>
                    </div>

                    {/* Right Column - User Details */}
                    <div className="w-1/2 space-y-6">
                        {/* Email Display */}
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Email</h3>
                            <p className="text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                                {email}
                            </p>
                        </div>

                        {/* Username Section */}
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Username</h3>
                            <div className="flex items-center gap-4">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="flex-1 p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter new username"
                                    />
                                ) : (
                                    <p className="flex-1 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                                        {username}
                                    </p>
                                )}
                                <button
                                    onClick={() => {
                                        if (isEditing) {
                                            handleProfileUpdate();
                                        } else {
                                            setIsEditing(true);
                                        }
                                    }}
                                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <Edit2
                                        size={20}
                                        className={`${isEditing ? 'text-blue-500' : 'text-gray-500'} hover:text-blue-600`}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Save Changes Button */}
                        <button
                            onClick={handleProfileUpdate}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                        >
                            Save Changes
                        </button>

                        {/* Delete Account Button */}
                        <button
                            onClick={handleDeleteAccount}
                            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                        >
                            <Trash2 size={20} />
                            Delete Account
                        </button>

                        {/* Error Message */}
                        {error && (
                            <div className="text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
                                {error}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsOverlay;