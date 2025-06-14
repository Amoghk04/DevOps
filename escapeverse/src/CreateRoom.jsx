import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid"; // install with `npm install uuid`

function CreateRoom() {
    const handleStartRoom = (themeKey) => {
        const roomId = uuidv4();
        // Make it very explicit that this user is the creator/host
        console.log("Creating room as host");
        localStorage.setItem("isRoomHost", "true");
        localStorage.setItem("roomHostId", roomId);
        if (themeKey == "tech") {
            navigate(`/room/${roomId}?theme=${themeKey}&creator=true`);
        } else {
            alert("This page is still under development");
            navigate('/home');
        }
    };
    
    const navigate = useNavigate();

    const themes = [
        {
            name: "Tech Lab Escape",
            description:
                "Hack into the system, decode digital puzzles, and escape a high-security tech lab.",
            gradient: "from-cyan-500 to-blue-500",
            darkShadow: "dark:hover:shadow-cyan-500/40",
            key: "tech",
        },
        {
            name: "Ancient Tomb",
            description:
                "Solve riddles of the pharaohs and unlock the mysteries of the pyramid.",
            gradient: "from-yellow-500 to-orange-500",
            darkShadow: "dark:hover:shadow-yellow-500/40",
            key: "mystery",
        },
        {
            name: "Haunted Mansion",
            description:
                "Unravel the secrets of a haunted estate filled with eerie clues.",
            gradient: "from-purple-500 to-indigo-500",
            darkShadow: "dark:hover:shadow-purple-500/40",
            key: "horror",
        },
    ];

    return (
        <div
            className="min-h-screen w-full px-10 py-20 relative flex flex-col items-center gap-10"
            style={{
                backgroundImage: 'url(/bg1.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundColor: '#1a1a1a',
            }}
        >
            <div className="absolute inset-0 bg-black opacity-60 z-0" />

            <h1 className="relative z-10 text-4xl md:text-5xl font-bold text-white text-center">
                Choose a Room Theme
            </h1>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
                {themes.map((theme, idx) => (
                    <div
                        key={idx}
                        role="group"
                        aria-labelledby={`theme-title-${idx}`}
                        className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-8 rounded-3xl shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-[0_0_35px_rgba(56,189,248,0.6)] ${theme.darkShadow} group`}
                    >
                        <h2
                            id={`theme-title-${idx}`}
                            className={`text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r ${theme.gradient}`}
                        >
                            {theme.name}
                        </h2>
                        <p 
                            id={`theme-desc-${idx}`}
                            className="text-gray-700 dark:text-gray-300 mb-6 group-hover:text-blue-900 dark:group-hover:text-blue-300 transition-colors duration-300"
                        >
                            {theme.description}
                        </p>
                        <button
                            onClick={() => handleStartRoom(theme.key)}
                            className={`block w-full p-4 bg-gradient-to-r ${theme.gradient} hover:brightness-110 rounded-xl text-white text-center font-semibold shadow-md transition-all duration-300`}
                            aria-label={`Create Room`}
                            aria-describedby={`theme-desc-${idx}`}
                        >
                            Create Room
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CreateRoom;