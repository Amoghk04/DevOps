import { useState, useEffect, useRef } from 'react';
import InteractiveImageMap from './InteractiveImageMap';

const TypewriterText = ({ text, onComplete, className }) => {
  const [displayText, setDisplayText] = useState('');
  const index = useRef(0);
  
  useEffect(() => {
    if (index.current < text.length) {
      const typingTimer = setTimeout(() => {
        setDisplayText(prev => prev + text[index.current]);
        index.current += 1;
      }, 40); // Typing speed - adjust as needed
      
      return () => clearTimeout(typingTimer);
    } else if (onComplete) {
      onComplete();
    }
  }, [displayText, text, onComplete]);
  
  return <span className={className}>{displayText}</span>;
};

const Gates = () => {
  const [leverActivated, setLeverActivated] = useState(false);
  const [keypadActivated, setKeypadActivated] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [showLeverMessage, setShowLeverMessage] = useState(false);
  const [typingComplete, setTypingComplete] = useState(false);
  const [statusText, setStatusText] = useState('');
  
  // Create a ref for handling outside clicks
  const overlayRef = useRef(null);
  const keypadRef = useRef(null);
  
  // Define interactive areas with their coordinates and handlers
  const areas = [
    {
      id: 'lever',
      coords: "622,271,686,271,684,461,671,466,667,490,595,492,579,488,581,468,588,448,603,441,623,436,623,359",
      onClick: (area) => {
        console.log('Lever clicked!', area);
        setShowLeverMessage(true);
        setTypingComplete(false);
        setStatusText('');
        
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
    }
  ];

  // Add event listener for clicks outside the overlays
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Handle lever message overlay
      if (showLeverMessage && 
          overlayRef.current && 
          !overlayRef.current.contains(event.target)) {
        setShowLeverMessage(false);
      }
      
      // Handle keypad overlay
      if (keypadActivated && 
          keypadRef.current && 
          !keypadRef.current.contains(event.target)) {
        setKeypadActivated(false);
      }
    };
    
    // Add the event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Cleanup the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLeverMessage, keypadActivated]);

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

  // Handle typing completion
  const handleTypingComplete = () => {
    setTypingComplete(true);
    setLeverActivated(true);
  };

  // Handle status text typing completion
  const handleStatusTypingComplete = () => {
    // Nothing special needs to happen when the second line completes
  };

  return (
    <div className="relative">
      <InteractiveImageMap 
        imageSrc="/door-finale.png"
        areas={areas}
        fullscreenOnMount={true}
        showDebug={true}
      />
      
      {/* Tech-styled text overlay at bottom center when lever is activated */}
      {showLeverMessage && (
        <div 
          ref={overlayRef}
          className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-green-400 p-4 rounded-lg border border-green-500 shadow-lg min-w-80 text-center"
        >
          <div className="font-mono tracking-wider text-lg uppercase">
            <span className="text-xs mr-2">[SYS]</span>
            <TypewriterText 
              text="LEVER MECHANISM ACTIVATED" 
              onComplete={handleTypingComplete}
              className=""
            />
          </div>
          {typingComplete && (
            <div className="font-mono text-sm mt-1 text-green-300">
              <TypewriterText 
                text="HYDRAULIC PRESSURE ENGAGED: 87.3%" 
                onComplete={handleStatusTypingComplete}
                className=""
              />
            </div>
          )}
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

export default Gates;