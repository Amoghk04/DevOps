import { useState, useRef, useEffect } from 'react';
import LogicGatePuzzle from './LogicGates';

const GateComponent = ({ gatePositions, onGateClick }) => {
  const [activeGate, setActiveGate] = useState(null);
  const gateOverlayRef = useRef(null);

  // Store a separate LogicGatePuzzle state per gate
  const [gatePuzzles, setGatePuzzles] = useState({});

  // Handle gate click
  const handleGateClick = (gateNumber) => {
    setActiveGate(gateNumber);

    // Initialize puzzle state for this gate if not already
    if (!gatePuzzles[gateNumber]) {
      setGatePuzzles(prev => ({
        ...prev,
        [gateNumber]: <LogicGatePuzzle key={`puzzle-${gateNumber}`} />
      }));
    }

    if (onGateClick) onGateClick(gateNumber);
    console.log(`Gate ${gateNumber} clicked!`);
  };

  // Close overlay on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeGate && gateOverlayRef.current && !gateOverlayRef.current.contains(event.target)) {
        setActiveGate(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeGate]);

  return (
    <>
      {/* Gate buttons */}
      {gatePositions.map((position, index) => {
        const gateNumber = index + 1;
        return (
          <div
            key={`gate-${gateNumber}`}
            className="absolute z-10 cursor-pointer"
            style={{ left: `${position.left}px`, top: `${position.top}px` }}
            onClick={() => handleGateClick(gateNumber)}
          >
            <div className="w-16 h-20 bg-amber-900 bg-opacity-70 flex flex-col items-center justify-center hover:bg-opacity-90 transition-all">
              <div className="w-full h-2 bg-amber-700 mb-1"></div>
              <div className="w-full h-2 bg-amber-700 mb-1"></div>
            </div>
          </div>
        );
      })}

      {/* Gate puzzle overlay */}
      {activeGate && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            ref={gateOverlayRef}
            className="bg-black w-full h-full rounded-xl p-6 flex flex-col items-center justify-center"
          >
            <div className="text-2xl text-amber-500 mb-4">Gate {activeGate} Circuit</div>

            {/* Display the LogicGatePuzzle as the full circuit */}
            <LogicGatePuzzle />

          </div>
        </div>
      )}
    </>
  );
};

export default GateComponent;
