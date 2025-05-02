import { useState, useEffect, useRef } from 'react';
import InteractiveImageMap from '../InteractiveImageMap';
import { useNavigate } from 'react-router-dom';
import { useGame } from './GameProvider';

const Wall2 = () => {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { isDark } = useGame();
  
  // Define interactive areas specific to the left wall
  const areas = [
    // Add any clickable areas specific to the left wall
    
    // Add more interactive areas specific to the left wall here
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

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <div className="relative w-full h-full">
        <InteractiveImageMap
          imageSrc="/wall2.png" // Replace with your actual left wall image
          areas={areas}
          fullscreenOnMount={true}
          showDebug={true}
          className="w-full h-full object-cover"
        />

        {/* Right Arrow Navigation Indicator */}
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

        <div className="absolute right-8 top-1/2 transform -translate-y-1/2 z-10">
          <div 
            className="w-16 h-16 bg-gray-800 bg-opacity-70 rounded-full flex items-center justify-center cursor-pointer hover:bg-opacity-90 transition-all"
            onClick={() => navigate('/wall1')} // Navigate back to the center wall
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

export default Wall2;