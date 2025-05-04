import { useState, useEffect, useRef } from 'react';
import InteractiveImageMap from '../InteractiveImageMap';
import { useNavigate } from 'react-router-dom';
import { useGame } from './GameProvider';

const Wall4 = () => {
    const navigate = useNavigate();
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const { isDark } = useGame();
    const [currentImage, setCurrentImage] = useState("/wall4-closed.png");

    // Define interactive areas specific to the left wall
    const areas = [
        // Add any clickable areas specific to the left wall
        {
            id: 'window',
            coords: "453,76,811,78,812,520,454,522",
            onClick: () => {
                console.log('server-1 clicked!');
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
            coords: "484,47,984,47,982,784,481,784",
            onClick: () => {
            },
        },
        {
            id: 'passcode',
            coords: "1021,264,1066,264,1067,327,1021,327",
            onClick: () => {
                setCurrentImage("/wall4.png"); // Change the image when clicked
            }
        }
    ]

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
                    imageSrc={currentImage}
                areas={currentImage === "/wall4.png" ? areas : areas1}
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

            {/* Add any interactive overlays specific to the left wall here */}
        </div>
    );
};

export default Wall4;