import { useState, useEffect } from 'react';
import InteractiveImageMap from '../InteractiveImageMap';
import { useNavigate } from 'react-router-dom';
import { useGame } from './GameProvider';
import ComputerScreen from './tech/Component/ComputerScreen';
import WirePuzzle from './tech/Component/WirePuzzle'; // Import the wire puzzle component

const Wall2 = () => {
    const navigate = useNavigate();
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const { isDark } = useGame();
    const { isPowerOn, setIsPowerOn } = useGame();
    const [showComputer, setShowComputer] = useState(false);
    const [showWirePuzzle, setShowWirePuzzle] = useState(false); // State to control wire puzzle visibility
    const [showMessage, setShowMessage] = useState(false); // State to show messages
    const [message, setMessage] = useState(''); // Message content
    const { playErrorSound } = useGame();

    // Display message function
    const displayMessage = (text, duration = 3000) => {
        setMessage(text);
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), duration);
    };

    // Handle puzzle completion
    const handlePuzzleComplete = () => {
        setIsPowerOn(true); // Correct usage
        setShowWirePuzzle(false);
        displayMessage('Power restored! The monitor can now be accessed.');
    };

    // Define interactive areas specific to the wall
    const areas = [
        {
            id: 'monitor',
            coords: "550,365,749,365,751,489,548,490",
            onClick: () => {
                if (!isPowerOn) {
                    displayMessage('ERROR: No power!');
                    playErrorSound(); // Play error sound
                } else {
                    setShowComputer(true); // Show the computer screen when the monitor is clicked
                }
            }
        },
        {
            id: 'fuseBox',
            coords: "365,520,364,408,444,409,444,520",
            onClick: () => {
                if (!isPowerOn) {
                    setShowWirePuzzle(true); // Show the wire puzzle when the fuseBox is clicked
                } else {
                    displayMessage('The power is already restored.');
                }
            }
        },
        {
            id: 'cpu',
            coords: "850,338,944,338,944,513,852,515",
            onClick: () => {
                if (!isPowerOn) {
                    displayMessage('ERROR: Need power to access the CPU!');
                } else {
                    displayMessage('The CPU is powered on.');
                }
            }
        },
        {
            id: 'pot',
            coords: "761,467,793,470,826,467,819,514,796,515,768,513",
            onClick: () => {
                displayMessage('Is there something beneath the pot?');
            }
        },
        {
            id: 'bookshelf',
            coords: "87,135,191,131,270,176,266,529,188,552,85,552",
            onClick: () => {
                displayMessage('Quite a collection of books. Nothing special.');
            }
        }
    ];

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };

        document.addEventListener('mousemove', handleMouseMove);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    // Handle closing the computer screen
    const handleCloseComputer = () => {
        setShowComputer(false);
    };

    return (
        <div className='no-select'>
            <div className="absolute inset-0 w-full h-full overflow-hidden">
                <div className="relative w-full h-full">
                    <InteractiveImageMap
                        imageSrc="/wall2.png"
                        areas={areas}
                        fullscreenOnMount={true}
                        showDebug={true}
                        className="w-full h-full object-cover"
                    />

                    {/* Left Arrow Navigation Indicator */}
                    <div className="absolute left-8 top-1/2 transform -translate-y-1/2 z-10">
                        <div
                            className="w-16 h-16 bg-gray-800 bg-opacity-70 rounded-full flex items-center justify-center cursor-pointer hover:bg-opacity-90 transition-all"
                            onClick={() => navigate('/wall3')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </div>
                    </div>

                    {/* Right Arrow Navigation */}
                    <div className="absolute right-8 top-1/2 transform -translate-y-1/2 z-10">
                        <div
                            className="w-16 h-16 bg-gray-800 bg-opacity-70 rounded-full flex items-center justify-center cursor-pointer hover:bg-opacity-90 transition-all"
                            onClick={() => navigate('/wall1')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>

                    {/* Torchlight overlay */}
                    {isDark && (
                        <div
                            className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
                            style={{
                                background: `radial-gradient(circle 100px at ${mousePos.x}px ${mousePos.y}px, transparent 0%, rgba(0,0,0,0.95) 100%)`,
                                transition: 'background-position 0.05s ease-out',
                            }}
                        ></div>
                    )}

                    {/* Message Overlay */}
                    {showMessage && (isPowerOn ? (
                        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-green-500 p-4 rounded-lg border border-green-500 text-center z-20">
                            {message}
                        </div>) :
                        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-red-500 p-4 rounded-lg border border-red-500 text-center z-20">
                            {message}
                        </div>
                    )}

                    {/* Computer Screen Component */}
                    <ComputerScreen
                        isOpen={showComputer}
                        onClose={handleCloseComputer}
                    />

                    {/* Wire Puzzle Component */}
                    {showWirePuzzle && (
                        <WirePuzzle
                            onComplete={handlePuzzleComplete}
                            onClose={() => setShowWirePuzzle(false)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Wall2;
