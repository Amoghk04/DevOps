import { useState, useRef, useEffect } from 'react';
import { useGame } from '../../../rooms/GameProvider';
import LogicGatePuzzle from './LogicGates';

const GateComponent = ({ gatePositions, onGateClick }) => {
  const [activeGate, setActiveGate] = useState(null);
  const gateOverlayRef = useRef(null);
  const { 
    playGateSolveSound,
    updateGateSolved,
    getOrCreateCircuit 
  } = useGame();

  // Handle gate click
  const handleGateClick = (gateNumber) => {
    setActiveGate(gateNumber);

    // Initialize puzzle state for this gate if not already
    getOrCreateCircuit(gateNumber);
    if (onGateClick) onGateClick(gateNumber);
  };

  // Close overlay on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (gateOverlayRef.current && !gateOverlayRef.current.contains(event.target)) {
        setActiveGate(null);
      }
    };

    if (activeGate) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            ref={gateOverlayRef}
            className="bg-orange-950 bg-opacity-80 w-[600px] h-[400px] rounded-xl p-4 flex flex-col items-center justify-center"
          >
            <div className="text-2xl text-amber-500 mb-4">Gate {activeGate} Circuit</div>
            <LogicGatePuzzle 
              gateNumber={activeGate} 
              onClose={() => setActiveGate(null)}
              circuit={getOrCreateCircuit(activeGate)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default GateComponent;
