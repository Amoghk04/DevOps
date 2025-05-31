import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUser } from "./UserContext";

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

    const prevIndex = currentIndex > 0 ? currentIndex - 1 : totalIcons - 1;
    const nextIndex = currentIndex < totalIcons - 1 ? currentIndex + 1 : 0;

    useEffect(() => {
        const userEmail = user?.email || "No email";
        setEmail(userEmail);
    }, [user]);

    const handleProfileUpdate = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/update-profile', {
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

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-2xl w-full mx-4 relative">
                {/* Close button */}
                <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </button>

                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Account Settings</h2>

                <div className="space-y-6">
                    {/* Profile Picture Carousel */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Profile Picture</h3>
                        <div className="flex items-center justify-center gap-4 my-8">
                            <button onClick={goToPrevious} className="p-2 rounded-full hover:bg-gray-400 transition-colors">
                                <ChevronLeft size={24} />
                            </button>

                            <div className="flex items-center">
                                <div className="w-16 h-16 rounded-full overflow-hidden relative opacity-70 transition-all duration-300 transform -mr-2">
                                    <div className="absolute w-full h-full bg-cover"
                                        style={{
                                            backgroundImage: "url('profile1.png')",
                                            backgroundSize: "300% 300%",
                                            backgroundPosition: `${getIconPosition(prevIndex).x} ${getIconPosition(prevIndex).y}`
                                        }}
                                    />
                                </div>

                                <div className="w-32 h-32 rounded-full overflow-hidden relative z-10">
                                    <div className="absolute w-full h-full bg-cover"
                                        style={{
                                            backgroundImage: "url('profile1.png')",
                                            backgroundSize: "300% 300%",
                                            backgroundPosition: `${getIconPosition(currentIndex).x} ${getIconPosition(currentIndex).y}`
                                        }}
                                    />
                                </div>

                                <div className="w-16 h-16 rounded-full overflow-hidden relative opacity-70 transition-all duration-300 transform -ml-2">
                                    <div className="absolute w-full h-full bg-cover"
                                        style={{
                                            backgroundImage: "url('profile1.png')",
                                            backgroundSize: "300% 300%",
                                            backgroundPosition: `${getIconPosition(nextIndex).x} ${getIconPosition(nextIndex).y}`
                                        }}
                                    />
                                </div>
                            </div>

                            <button onClick={goToNext} className="p-2 rounded-full hover:bg-gray-400 transition-colors">
                                <ChevronRight size={24} />
                            </button>
                        </div>
                    </div>

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
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                {isEditing ? 'Save' : 'Edit'}
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

                    {/* Error Message */}
                    {error && (
                        <div className="text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsOverlay;