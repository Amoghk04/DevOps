import { useState, useEffect, useRef } from 'react';
import InteractiveImageMap from '../InteractiveImageMap';
import { useNavigate } from 'react-router-dom';
import { useGame } from './GameProvider';
import GateComponent from './tech/Component/GateComponent';

const Wall1 = () => {
  const navigate = useNavigate(); // Hook for navigation
  const [keypadActivated, setKeypadActivated] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [showLeverMessage, setShowLeverMessage] = useState(false);
  const {
    isDark,
    setIsDark,
    wall1GatePositions,
    setWall1GatePositions,
    lightCode,
    playLightOnSound,
    cornerLights,
    gatesSolved,
    updateCornerLight,
    wall4code,
    isRoomOpened, 
    setIsRoomOpened
  } = useGame();
  const [showInputOverlay, setShowInputOverlay] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [shake, setShake] = useState(false);

  // Store whether the areas have been updated
  const [areasUpdated, setAreasUpdated] = useState(false);

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

  // Handle gate click from GateComponent
  const handleGateClick = (gateNumber) => {
    console.log(`Gate ${gateNumber} clicked from Wall1!`);
    // You can add any Wall1-specific gate handling here
  };

  // Define interactive areas with their coordinates and handlers
  // IMPORTANT: Move this BEFORE any useEffect that references it
  const [areas, setAreas] = useState([
    {
      id: 'lever',
      coords: "622,271,686,271,684,461,671,466,667,490,595,492,579,488,581,468,588,448,603,441,623,436,623,359",
      onClick: () => {
        console.log('Lever clicked!');
        setShowInputOverlay(true);
        setUserInput('');
        setTimeout(() => {
          setShowLeverMessage(false);
        }, 10000);
      }
    },
    {
      id: 'keypad',
      coords: "1165,419,1272,419,1272,556,1167,556",
      onClick: () => {
        console.log('Keypad clicked!' + wall4code);
        setKeypadActivated(true);
      }
    },
    {
      id: 'leftArrow',
      coords: "50,300,120,350", // Adjust these coordinates as needed
      onClick: () => {
        console.log('Left arrow clicked!');
        navigateToWall('left');
      }
    },
    {
      id: 'rightArrow',
      coords: "1200,300,1270,350", // Adjust these coordinates as needed
      onClick: () => {
        console.log('Right arrow clicked!');
        navigateToWall('right');
      }
    },
    // Gate areas will be dynamically updated with coordinates
    {
      id: 'gate1',
      coords: "250,350,320,450", // These coordinates will be updated
      onClick: () => {
        // Now handled by GateComponent
      }
    },
    {
      id: 'gate2',
      coords: "650,350,720,450", // These coordinates will be updated
      onClick: () => {
        // Now handled by GateComponent
      }
    },
    {
      id: 'gate3',
      coords: "1050,350,1120,450", // These coordinates will be updated
      onClick: () => {
        // Now handled by GateComponent
      }
    },
    {
      id: 'gate4', // Add this new gate
      coords: "850,350,920,450",
      onClick: () => {
        // Now handled by GateComponent
      }
    }
  ]);

  // Add new state for opened wall areas near other area states
  const [openedAreas] = useState([
    {
      id: 'door',
      coords: "511,127,834,129,831,854,511,848",
      onClick: () => {
        console.log('Door is opened!');        
      }
    },
  ]);

  // Generate gate positions on component mount if they don't exist in context
  useEffect(() => {
    // Only generate positions if they don't already exist in the game context
    if (wall1GatePositions && wall1GatePositions.length > 0) {
      return; // Positions already exist, no need to generate
    }

    // Generate new random positions
    // Define the boundaries for gate placement
    const minLeftPosition = 120; // Minimum left position
    const maxLeftPosition = window.innerWidth - 180; // Maximum left position
    const minTopPosition = 250; // Minimum top position  
    const maxTopPosition = 450; // Maximum top position

    // Define static elements to avoid overlapping with them
    const staticElements = [
      // Lever area - approximate rectangle
      { left: 580, top: 270, width: 110, height: 220 },
      // Keypad area
      { left: 1165, top: 419, width: 107, height: 137 },
      // Left navigation arrow
      { left: 50, top: 300, width: 70, height: 50 },
      // Right navigation arrow
      { left: 1200, top: 300, width: 70, height: 50 }
    ];

    // Function to check if a position overlaps with static elements
    const overlapsWithStatic = (position, width = 70, height = 100) => {
      // Add a buffer zone around static elements
      const buffer = 30;

      for (const element of staticElements) {
        // Check for overlap with buffer zone
        if (
          position.left < element.left + element.width + buffer &&
          position.left + width + buffer > element.left &&
          position.top < element.top + element.height + buffer &&
          position.top + height + buffer > element.top
        ) {
          return true; // Overlap detected
        }
      }
      return false; // No overlap
    };

    // Function to generate a random position within bounds
    const generateRandomPosition = () => {
      const left = Math.floor(Math.random() * (maxLeftPosition - minLeftPosition)) + minLeftPosition;
      const top = Math.floor(Math.random() * (maxTopPosition - minTopPosition)) + minTopPosition;
      return { left, top };
    };

    // Generate positions, ensuring they don't overlap with static elements or each other
    const positions = [];
    for (let i = 0; i < 4; i++) {
      let newPosition;
      let overlap;

      do {
        overlap = false;
        newPosition = generateRandomPosition();

        // Check if this position overlaps with static elements
        if (overlapsWithStatic(newPosition)) {
          overlap = true;
          continue;
        }

        // Check if this position overlaps with any existing gate positions
        for (const pos of positions) {
          // Define a minimum distance between gates
          const minDistance = 150;
          const distance = Math.sqrt(
            Math.pow(newPosition.left - pos.left, 2) +
            Math.pow(newPosition.top - pos.top, 2)
          );

          if (distance < minDistance) {
            overlap = true;
            break;
          }
        }
      } while (overlap);

      positions.push(newPosition);
    }

    // Save the new positions to game context instead of localStorage
    setWall1GatePositions(positions);
  }, [wall1GatePositions, setWall1GatePositions]);

  // Update the area coordinates for gates whenever wall1GatePositions changes
  useEffect(() => {
    if (wall1GatePositions.length > 0 && !areasUpdated) {
      // Create a copy of the areas array
      const newAreas = [...areas];

      // Update coordinates for each gate
      for (let i = 0; i < 4; i++) {
        const gateIndex = newAreas.findIndex(area => area.id === `gate${i + 1}`);
        if (gateIndex !== -1) {
          const pos = wall1GatePositions[i];
          // Create a new object for this area with updated coords
          newAreas[gateIndex] = {
            ...newAreas[gateIndex],
            coords: `${pos.left},${pos.top},${pos.left + 70},${pos.top + 100}`
          };
        }
      }

      // Update the areas state with the new array
      setAreas(newAreas);
      setAreasUpdated(true);
    }
  }, [wall1GatePositions, areas, areasUpdated]);

  // Add event listener for clicks outside the overlays
  useEffect(() => {
    const handleClickOutside = (event) => {
      console.log("Event");
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

  // Add this near the top of the component to check wall4code length
  useEffect(() => {
    console.log('wall4code length:', wall4code?.length);
  }, [wall4code]);

  // Update the pin input handler to allow more digits
  const handlePinInput = (digit) => {
    if (pinCode.length < (wall4code?.length || 6)) {
      setPinCode(prev => prev + digit);
    }
  };

  const clearPin = () => {
    setPinCode('');
  };

  // Update the submit function to compare with wall4code
  const submitPin = () => {
    console.log('PIN submitted:', pinCode);
    if (pinCode === wall4code) {
      console.log('Correct PIN!');
      setIsRoomOpened(true);
      setKeypadActivated(false); // Close the keypad
      setPinCode(''); // Reset the pin code
    } else {
      console.log('Wrong PIN!');
      setPinCode('');
    }
  };

  // Add useEffect to monitor gatesSolved status
  useEffect(() => {
    const cornerOrder = [0, 1, 3, 2]; // Top-left, Top-right, Bottom-right, Bottom-left
    gatesSolved.forEach((isSolved, index) => {
      if (isSolved) {
        updateCornerLight(cornerOrder[index]);
        console.log(`Gate ${index + 1} solved, updating corner light ${cornerOrder[index]}`); // Add logging
      }
    });
  }, [gatesSolved, updateCornerLight]); // Add updateCornerLight to dependencies

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <div className="relative w-full h-full">
        <InteractiveImageMap
          imageSrc={isRoomOpened ? "/wall-1-opened.png" : "/wall-1.png"} // Update image source based on wall state
          areas={isRoomOpened ? openedAreas : areas}
          fullscreenOnMount={true}
          showDebug={true}
          className="w-full h-full object-cover"
        />

        {/* Use GateComponent to render gates */}
        {isDark ? (
          <GateComponent
            gatePositions={wall1GatePositions}
            onGateClick={handleGateClick}
          />) : null
        }
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

        {/* Corner Lights - Add this right after your torchlight overlay */}
        {isDark && (
          <>
            {/* Top Left Corner */}
            <div
              className={`absolute top-8 left-8 w-6 h-6 rounded-full transition-all duration-500 z-20
                ${cornerLights[0]
                  ? 'bg-lime-500 shadow-[0_0_20px_5px_rgba(132,204,22,0.5)]'
                  : 'bg-gray-800'}`}
            />

            {/* Top Right Corner */}
            <div
              className={`absolute top-8 right-8 w-6 h-6 rounded-full transition-all duration-500 z-20
                ${cornerLights[1]
                  ? 'bg-lime-500 shadow-[0_0_20px_5px_rgba(132,204,22,0.5)]'
                  : 'bg-gray-800'}`}
            />

            {/* Bottom Right Corner */}
            <div
              className={`absolute bottom-8 right-8 w-6 h-6 rounded-full transition-all duration-500 z-20
                ${cornerLights[3]
                  ? 'bg-lime-500 shadow-[0_0_20px_5px_rgba(132,204,22,0.5)]'
                  : 'bg-gray-800'}`}
            />

            {/* Bottom Left Corner */}
            <div
              className={`absolute bottom-8 left-8 w-6 h-6 rounded-full transition-all duration-500 z-20
                ${cornerLights[2]
                  ? 'bg-lime-500 shadow-[0_0_20px_5px_rgba(132,204,22,0.5)]'
                  : 'bg-gray-800'}`}
            />
          </>
        )}
      </div>

      {/* overlay for light at center */}
      {showInputOverlay && (
        <div className="absolute inset-0 z-20 bg-black bg-opacity-80 flex items-center justify-center text-white font-mono">
          <div ref={overlayRef} className="bg-black p-6 rounded-lg border-4 border-white w-96">
            {isDark ? (
              <>
                <div className="mb-4 text-xl">Enter the code to lift the darkness:</div>
                <div className="flex justify-center gap-4 mb-4">
                  {[...Array(3)].map((_, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      value={userInput[index] || ''}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        if (newValue.length <= 1) {
                          const newInput = userInput.split('');
                          newInput[index] = newValue;
                          setUserInput(newInput.join(''));

                          // Auto-focus next input if available
                          if (newValue && index < 2) {
                            const nextInput = e.target.parentElement.nextElementSibling?.querySelector('input');
                            if (nextInput) nextInput.focus();
                          }
                        }
                      }}
                      onKeyDown={(e) => {
                        // Handle backspace to move to previous input
                        if (e.key === 'Backspace' && !userInput[index] && index > 0) {
                          const prevInput = e.target.parentElement.previousElementSibling?.querySelector('input');
                          if (prevInput) prevInput.focus();
                        }
                      }}
                      className={`w-16 h-16 text-center text-3xl bg-gray-800 rounded-md 
                        border-2 ${shake ? 'animate-shake' : ''} 
                        ${userInput[index] ? 'border-green-500' : 'border-white'} 
                        text-white focus:outline-none focus:border-blue-500`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => {
                    console.log('Light code:', lightCode);
                    if (userInput.length < 3) {
                      setShake(true);
                      setTimeout(() => setShake(false), 500);
                      return;
                    }
                    else if (userInput === lightCode) {
                      playLightOnSound();
                      setIsDark(false);
                      setShowInputOverlay(false);
                    } else {
                      setShake(true);
                      setTimeout(() => setShake(false), 500);
                      setUserInput('');
                    }
                  }}
                  className="w-full px-4 py-2 bg-green-600 rounded hover:bg-green-700"
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
            <div className="bg-gray-900 p-2 rounded flex flex-col items-center">
              {/* First row - first 6 digits */}
              <div className="flex justify-center mb-2">
                {[...Array(Math.min(6, wall4code?.length || 6))].map((_, i) => (
                  <div key={i} className="w-8 h-10 mx-1 border border-blue-500 rounded flex items-center justify-center text-xl text-blue-300 font-mono">
                    {pinCode.length > i ? '•' : ''}
                  </div>
                ))}
              </div>
              
              {/* Second row - remaining digits if more than 6 */}
              {(wall4code?.length > 6) && (
                <div className="flex justify-center">
                  {[...Array(wall4code.length - 6)].map((_, i) => (
                    <div key={i + 6} className="w-8 h-10 mx-1 border border-blue-500 rounded flex items-center justify-center text-xl text-blue-300 font-mono">
                      {pinCode.length > i + 6 ? '•' : ''}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '✓'].map((btn) => (
              <button
                key={btn}
                className={`w-12 h-12 rounded-full font-mono text-xl flex items-center justify-center hover:opacity-80 active:opacity-60
                  ${typeof btn === 'number' 
                    ? 'bg-gray-800 text-blue-300 border border-blue-400' 
                    : btn === 'C'
                      ? 'bg-red-900 text-red-300 border border-red-500'
                      : 'bg-green-900 text-green-300 border border-green-500'
                  }`}
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
      )},
    </div>
  );
};

export default Wall1;