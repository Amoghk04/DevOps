import { useState, useEffect } from 'react';
import InteractiveImageMap from '../InteractiveImageMap';
import { useNavigate } from 'react-router-dom';
import { useGame } from './GameProvider';
import ServerScreen from './tech/Component/ServerScreen';
import Server2Screen from './tech/Component/Server2Screen';
import Server3Screen from './tech/Component/Server3Screen';
import CodePrompt from './tech/Component/codePrompt';
import ErrorBoundary from '../components/ErrorBoundary';

const Wall3 = () => {
    const navigate = useNavigate();
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const { isDark } = useGame();
    const { serverRoomKey, server2Code } = useGame();
    const [showServer1Screen, setShowServer1Screen] = useState(false);
    const [showServer2Screen, setShowServer2Screen] = useState(false);
    const [showServer3Screen, setShowServer3Screen] = useState(false);
    const [showCodePrompt, setShowCodePrompt] = useState(false);

    // Define interactive areas specific to the left wall
    const areas = [
        // Add any clickable areas specific to the left wall
        {
            id: 'server-1',
            coords: "148,140,400,141,402,639,150,640",
            onClick: () => {
                console.log('server-1 clicked!');
                console.log(`${serverRoomKey}`)
                setShowCodePrompt(true);
            }
        },
        {
            id: 'server-2',
            coords: "500,138,755,139,755,639,499,640",
            onClick: () => {
                console.log('server-2 clicked!');
                console.log(`${server2Code}`);
                setShowServer2Screen(true);
            }
        },
        {
            id: 'server-3',
            coords: "847,138,1099,141,1102,635,851,637",
            onClick: () => {
                console.log('server-3 clicked!');
                setShowServer3Screen(true);
            }
        },
        // Add more interactive areas specific to the left wall here
    ];

    const handleCodeSuccess = () => {
        setShowCodePrompt(false);
        setShowServer1Screen(true);
    }

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
                    imageSrc="/wall3.png"
                    areas={areas}
                    fullscreenOnMount={true}
                    showDebug={true}
                    className="w-full h-full object-cover"
                />

                <CodePrompt
                    isOpen={showCodePrompt}
                    onClose={() => setShowCodePrompt(false)}
                    onSubmit={handleCodeSuccess}
                    correctCode={serverRoomKey}
                />

                <div data-testid="server1-screen-root">
                    {showServer1Screen && (
                        <ErrorBoundary onReset={() => setShowServer1Screen(false)}>
                            <ServerScreen
                                isOpen={true}
                                onClose={() => setShowServer1Screen(false)}
                            />
                        </ErrorBoundary>
                    )}
                </div>

                <div data-testid="server2-screen-root">
                    {showServer2Screen && (
                        <ErrorBoundary onReset={() => setShowServer2Screen(false)}>
                            <Server2Screen
                                isOpen={true}
                                onClose={() => setShowServer2Screen(false)}
                            />
                        </ErrorBoundary>
                    )}
                </div>

                <div data-testid="server3-screen-root">
                {showServer3Screen && (
                    <ErrorBoundary onReset={() => setShowServer3Screen(false)}>
                        <Server3Screen
                            isOpen={true}
                            onClose={() => setShowServer3Screen(false)}
                        />
                    </ErrorBoundary>
                )}
                </div>

                {/* Right Arrow Navigation Indicator */}
                <div className="absolute left-8 top-1/2 transform -translate-y-1/2 z-10">
                    <div
                        data-testid="left-arrow"
                        className="w-16 h-16 bg-gray-800 bg-opacity-70 rounded-full flex items-center justify-center cursor-pointer hover:bg-opacity-90 transition-all"
                        onClick={() => navigate('/wall4')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </div>
                </div>

                <div className="absolute right-8 top-1/2 transform -translate-y-1/2 z-10">
                    <div
                        data-testid="right-arrow"
                        className="w-16 h-16 bg-gray-800 bg-opacity-70 rounded-full flex items-center justify-center cursor-pointer hover:bg-opacity-90 transition-all"
                        onClick={() => navigate('/wall2')} // Navigate back to the center wall
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

export default Wall3;