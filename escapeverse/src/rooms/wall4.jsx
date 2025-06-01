import { useState, useEffect } from 'react';
import InteractiveImageMap from '../InteractiveImageMap';
import { useNavigate } from 'react-router-dom';
import { useGame } from './GameProvider';
import TileGrid from './tech/Component/Tiles';

const Wall4 = () => {
    const navigate = useNavigate();
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const { isDark, isWindowClosed, setIsWindowClosed, wall3code } = useGame();
    //const [currentImage, setCurrentImage] = useState("/wall4-closed.png");
    const [showTileGrid, setShowTileGrid] = useState(false); // State to control tile grid visibility
    const [pinCode, setPinCode] = useState('');
    const [showPinInput, setShowPinInput] = useState(false);
    const [pinError, setPinError] = useState('');

    // Define interactive areas specific to the left wall
    const areas = [
        // Add any clickable areas specific to the left wall
        {
            id: 'window',
            coords: "453,76,811,78,812,520,454,522",
            onClick: () => {
                console.log('server-1 clicked!');
                setShowTileGrid(true); // Show the tile grid when window is clicked
            },
        },
        {
            id: 'passcode',
            coords: "851,217,879,218,879,249,851,249",
            onClick: () => {
                console.log('passcode clicked!');
            }
        }

        // Add more interactive areas specific to the left wall here
    ];

    const areas1 = [
        {
            id: 'closed-window',
            coords: "484,121,984,121,982,754,481,754",
            onClick: () => {
                console.log(wall3code);

            },
        },
        {
            id: 'passcode',
            coords: "1021,305,1066,305,1067,357,1021,357",
            onClick: () => {
                setShowPinInput(true);
            }
        }
    ]

    // Close the tile grid puzzle
    const handleCloseTileGrid = () => {
        setShowTileGrid(false);
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };

        document.addEventListener('mousemove', handleMouseMove);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
            <div className="relative w-full h-full">
                <InteractiveImageMap
                    imageSrc={!isWindowClosed ? "/wall4.png" : "/wall4-closed.png"}
                    areas={!isWindowClosed ? areas : areas1}
                    fullscreenOnMount={true}
                    showDebug={true}
                    className="w-full h-full object-cover"
                />

                {/* Right Arrow Navigation Indicator */}
                <div className="absolute left-8 top-1/2 transform -translate-y-1/2 z-10">
                    <div
                        className="w-16 h-16 bg-gray-800 bg-opacity-70 rounded-full flex items-center justify-center cursor-pointer hover:bg-opacity-90 transition-all"
                        onClick={() => navigate('/wall1')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </div>
                </div>

                <div className="absolute right-8 top-1/2 transform -translate-y-1/2 z-10">
                    <div
                        className="w-16 h-16 bg-gray-800 bg-opacity-70 rounded-full flex items-center justify-center cursor-pointer hover:bg-opacity-90 transition-all"
                        onClick={() => navigate('/wall3')} // Navigate back to the center wall
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>

                {/* Tile Grid Modal */}
                {showTileGrid && (
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                        <div className="bg-black bg-opacity-70 absolute inset-0" onClick={handleCloseTileGrid}></div>
                        <div className="bg-grey-900 rounded-xl p-6 shadow-2xl relative z-30 max-w-2xl">
                            <button
                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                                onClick={handleCloseTileGrid}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <div className="text-center mb-4">
                            </div>
                            <TileGrid />
                        </div>
                    </div>
                )}

                {/* Pin Code Input Modal */}
                {showPinInput && (
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                        <div className="bg-black bg-opacity-70 absolute inset-0" 
                             onClick={() => setShowPinInput(false)}></div>
                        <div className="bg-gray-800 dark:bg-gray-800 rounded-xl p-6 border-2 border-green-500 shadow-2xl relative z-30">
                            <button
                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                onClick={() => setShowPinInput(false)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <div className="text-center">
                                <h3 className="text-xl font-bold mb-4 text-green-500 dark:text-green-500">Enter Security Code</h3>
                                <input
                                    type="password"
                                    value={pinCode}
                                    onChange={(e) => {
                                        setPinCode(e.target.value);
                                        setPinError('');
                                    }}
                                    className="w-full px-4 py-2 border rounded-lg mb-4 text-center text-lg"
                                    maxLength="6"
                                    placeholder="******"
                                />
                                {pinError && (
                                    <p className="text-red-500 mb-4">{pinError}</p>
                                )}
                                <button
                                    onClick={() => {
                                        if (pinCode === wall3code) {
                                            setIsWindowClosed(false);
                                            setShowPinInput(false);
                                            setPinCode('');
                                        } else {
                                            setPinError('Incorrect code. Try again.');
                                            setPinCode('');
                                        }
                                    }}
                                    className="w-full bg-green-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                                >
                                    Enter
                                </button>
                            </div>
                        </div>
                    </div>
                )}

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
            </div>
        </div>
    );
};

export default Wall4;