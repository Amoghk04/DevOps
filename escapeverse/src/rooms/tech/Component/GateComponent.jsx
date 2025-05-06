import { useState, useRef, useEffect } from 'react';

const GateComponent = ({ 
  gatePositions, 
  onGateClick 
}) => {
  const [activeGate, setActiveGate] = useState(null);
  const gateOverlayRef = useRef(null);
  
  // Handle gate click
  const handleGateClick = (gateNumber) => {
    setActiveGate(gateNumber);
    if (onGateClick) {
      onGateClick(gateNumber);
    }
    console.log(`Gate ${gateNumber} clicked!`);
  };
  
  // Add event listener for clicks outside the overlay
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Hide gate info overlay when clicked outside
      if (activeGate && gateOverlayRef.current && !gateOverlayRef.current.contains(event.target)) {
        setActiveGate(null);
      }
    };

    // Add the event listener
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeGate]);

  return (
    <>
      {/* Dynamically position gate icons based on random positions */}
      {gatePositions.map((position, index) => (
        <div 
          key={`gate-${index+1}`}
          className="absolute z-10 cursor-pointer"
          style={{ 
            left: `${position.left}px`, 
            top: `${position.top}px` 
          }}
          onClick={() => handleGateClick(index+1)}
        >
          <div className="w-16 h-20 border-4 border-amber-600 rounded-t-lg bg-amber-900 bg-opacity-70 flex flex-col items-center justify-center hover:bg-opacity-90 transition-all">
            <div className="w-full h-2 bg-amber-700 mb-1"></div>
            <div className="w-full h-2 bg-amber-700 mb-1"></div>
            <div className="text-white text-xs font-bold"></div>
          </div>
        </div>
      ))}

      {/* Gate info overlay when clicked */}
      {activeGate && (
        <div 
          className="absolute inset-0 z-30 bg-black bg-opacity-80 flex items-center justify-center text-white font-mono"
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            ref={gateOverlayRef} 
            className="bg-black p-6 rounded-lg border-4 border-amber-600 w-96"
          >
            <div className="text-2xl text-amber-500 mb-4">Gate {activeGate}</div>
            <div className="mb-4">
              This ancient gate appears to be locked. There might be a way to unlock it elsewhere in the room.
            </div>
            <button
              onClick={() => setActiveGate(null)}
              className="mt-2 px-4 py-2 bg-amber-700 rounded hover:bg-amber-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default GateComponent;