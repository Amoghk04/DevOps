import { useState, useEffect, useRef } from 'react';
import InteractiveImageMap from '../InteractiveImageMap';
import {useNavigate} from 'react-router-dom';

const Wall1 = () => {
  const navigate = useNavigate(); // Hook for navigation
  const [keypadActivated, setKeypadActivated] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [showLeverMessage, setShowLeverMessage] = useState(false);
  const [isDark, setIsDark] = useState(true); // true = torch mode
  const [showInputOverlay, setShowInputOverlay] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [shake, setShake] = useState(false);

  // Create a ref for handling outside clicks
  const overlayRef = useRef(null);
  const keypadRef = useRef(null);

  // Navigation function to other walls
  const navigateToWall = (direction) => {
    // Replace these paths with your actual component paths
    if (direction === 'left') {
      navigate('/wall2'); // Navigate to the left wall component
    } else if (direction === 'right') {
      navigate('/wall4'); // Navigate to the right wall component
    }
  };

  // Define interactive areas with their coordinates and handlers
  const areas = [
    {
      id: 'lever',
      coords: "622,271,686,271,684,461,671,466,667,490,595,492,579,488,581,468,588,448,603,441,623,436,623,359",
      onClick: (area) => {
        console.log('Lever clicked!', area);
        setShowInputOverlay(true);
        setUserInput('');

        // Reset the lever activation after message disappears
        setTimeout(() => {
          setShowLeverMessage(false);
        }, 10000);
      }
    },
    {
      id: 'keypad',
      coords: "1165,419,1272,419,1272,556,1167,556",
      onClick: (area) => {
        console.log('Keypad clicked!', area);
        setKeypadActivated(true);
      }
    },
    {
      id: 'leftArrow',
      coords: "50,300,120,350", // Adjust these coordinates as needed
      onClick: (area) => {
        console.log('Left arrow clicked!', area);
        navigateToWall('left');
      }
    },
    {
      id: 'rightArrow',
      coords: "1200,300,1270,350", // Adjust these coordinates as needed
      onClick: (area) => {
        console.log('Right arrow clicked!', area);
        navigateToWall('right');
      }
    },
  ];

  // Add event listener for clicks outside the overlays
  useEffect(() => {
    const handleClickOutside = (event) => {
      console.log("Even");
      console.log("event.target:", event.target); // Log the clicked target element
      console.log("keypadRef.current:", keypadRef.current); // Log keypad reference
      console.log("overlayRef.current:", overlayRef.current); // Log overlay reference

      // Handle keypad overlay
      if (keypadActivated && keypadRef.current && !keypadRef.current.contains(event.target)) {
        setKeypadActivated(false);
      }

      // Hide the lever input overlay when clicked outside
      if (showInputOverlay && overlayRef.current && !overlayRef.current.contains(event.target)) {
        setShowInputOverlay(false);
      }
    };

    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    // Add the event listener
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('mousemove', handleMouseMove);

    // Cleanup the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [showLeverMessage, keypadActivated, showInputOverlay]);

  // Handle keypad input
  const handlePinInput = (digit) => {
    if (pinCode.length < 4) {
      setPinCode(prev => prev + digit);
    }
  };

  const clearPin = () => {
    setPinCode('');
  };

  const submitPin = () => {
    console.log('PIN submitted:', pinCode);
    // Check if PIN is correct
    if (pinCode === '1234') { // Replace with your desired PIN
      console.log('Correct PIN!');
      // Add successful PIN entry logic here
    } else {
      console.log('Wrong PIN!');
      setPinCode('');
    }
  };

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <div className="relative w-full h-full">
        <InteractiveImageMap
          imageSrc="/wall-1.png"
          areas={areas}
          fullscreenOnMount={true}
          showDebug={true}
          className="w-full h-full object-cover"
        />

        {/* Arrow Navigation Indicators */}
        <div className="absolute left-8 top-1/2 transform -translate-y-1/2 z-10">
          <div 
            className="w-16 h-16 bg-gray-800 bg-opacity-70 rounded-full flex items-center justify-center cursor-pointer hover:bg-opacity-90 transition-all"
            onClick={() => navigateToWall('left')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
        </div>

        <div className="absolute right-8 top-1/2 transform -translate-y-1/2 z-10">
          <div 
            className="w-16 h-16 bg-gray-800 bg-opacity-70 rounded-full flex items-center justify-center cursor-pointer hover:bg-opacity-90 transition-all"
            onClick={() => navigateToWall('right')}
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

      {/* overlay for light at center */}
      {showInputOverlay && (
        <div

          className="absolute inset-0 z-20 bg-black bg-opacity-80 flex items-center justify-center text-white font-mono"
          onClick={(e) => e.stopPropagation()} // prevent bubbling
        >
          <div ref={overlayRef} className="bg-black p-6 rounded-lg border-4 border-white w-96">
            {isDark ? (
              <>
                <div className="mb-4 text-xl">Enter the command to lift the darkness:</div>
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className={`p-2 rounded text-black transition-transform ${shake ? 'animate-shake' : ''} border-2 border-white`}
                  placeholder="Type here..."
                />
                <button
                  onClick={() => {
                    if (userInput.toLowerCase().trim() === 'light') {
                      setIsDark(false);
                      setShowInputOverlay(false);
                    } else {
                      setShake(true);
                      setTimeout(() => setShake(false), 500);
                      setUserInput('');
                    }
                  }}
                  className="mt-2 px-4 py-2 bg-green-600 rounded hover:bg-green-700"
                >
                  Submit
                </button>
              </>
            ) : (
              <div className="text-xl">Light is already on!</div>
            )}
          </div>
        </div>
      )}

      {/* Show keypad overlay when keypad is activated */}
      {keypadActivated && (
        <div
          ref={keypadRef}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-90 p-6 rounded-lg shadow-2xl border border-blue-500"
        >
          <div className="text-center mb-4">
            <div className="text-blue-400 text-xl mb-2 font-mono tracking-wider uppercase">Security Code</div>
            <div className="bg-gray-900 p-2 rounded flex justify-center">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-8 h-10 mx-1 border border-blue-500 rounded flex items-center justify-center text-xl text-blue-300 font-mono">
                  {pinCode.length > i ? '•' : ''}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '✓'].map((btn) => (
              <button
                key={btn}
                className={`w-12 h-12 rounded-full font-mono 
                  ${typeof btn === 'number' ? 'bg-gray-800 border border-blue-400' :
                    (btn === 'C' ? 'bg-red-900 border border-red-500' : 'bg-green-900 border border-green-500')} 
                  text-blue-300 text-xl flex items-center justify-center hover:opacity-80 active:opacity-60`}
                onClick={() => {
                  if (typeof btn === 'number') {
                    handlePinInput(btn);
                  } else if (btn === 'C') {
                    clearPin();
                  } else if (btn === '✓') {
                    submitPin();
                  }
                }}
              >
                {btn}
              </button>
            ))}
          </div>

          <button
            className="mt-4 w-full bg-gray-800 text-blue-300 p-2 rounded hover:bg-gray-700 font-mono tracking-wider uppercase border border-blue-400"
            onClick={() => setKeypadActivated(false)}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default Wall1;