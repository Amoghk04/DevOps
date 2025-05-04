import { useState, useRef, useEffect } from 'react';

const WirePuzzle = ({ onComplete, onClose }) => {
  const COLORS = ['red', 'yellow', 'blue', 'green'];
  const [wires, setWires] = useState([]);
  const [selectedWire, setSelectedWire] = useState(null);
  const [connections, setConnections] = useState({});
  const [completedWires, setCompletedWires] = useState([]);
  const [gameComplete, setGameComplete] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Initialize the game
  useEffect(() => {
    initializeGame();
  }, []);

  // Check if game is complete
  useEffect(() => {
    if (completedWires.length === COLORS.length && !gameComplete) {
      setGameComplete(true);
      setTimeout(() => {
        onComplete();
      }, 1000);
    }
  }, [completedWires, gameComplete, onComplete]);

  const initializeGame = () => {
    // Create wires with shuffled right endpoints
    const shuffledColors = [...COLORS].sort(() => Math.random() - 0.5);
    
    const newWires = COLORS.map((color, index) => ({
      id: `wire-${index}`,
      color,
      rightId: `right-${shuffledColors[index]}`,
      rightColor: shuffledColors[index]
    }));
    
    setWires(newWires);
    setSelectedWire(null);
    setConnections({});
    setCompletedWires([]);
    setGameComplete(false);
  };

  const handleWireMouseDown = (wire) => {
    if (completedWires.includes(wire.id)) return;
    setSelectedWire(wire);
  };

  const handleMouseMove = (e) => {
    if (!selectedWire) return;
    
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    setDragPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseUp = (e) => {
    if (!selectedWire) return;
    
    // Check if mouse is over any right endpoint
    const rightEndpoints = document.querySelectorAll('.right-endpoint');
    const hoveredEndpoint = Array.from(rightEndpoints).find(endpoint => {
      const rect = endpoint.getBoundingClientRect();
      return (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      );
    });
    
    if (hoveredEndpoint) {
      const rightId = hoveredEndpoint.getAttribute('data-id');
      const correctEndpoint = rightId === `right-${selectedWire.color}`;
      
      // Connect the wire
      setConnections(prev => ({
        ...prev,
        [selectedWire.id]: {
          rightId,
          correct: correctEndpoint
        }
      }));
      
      if (correctEndpoint) {
        setCompletedWires(prev => [...prev, selectedWire.id]);
      }
    } else {
      // Remove connection if dragged away
      setConnections(prev => {
        const newConnections = {...prev};
        delete newConnections[selectedWire.id];
        return newConnections;
      });
    }
    
    setSelectedWire(null);
  };

  const renderWire = (wire) => {
    const isSelected = selectedWire && selectedWire.id === wire.id;
    const isConnected = connections[wire.id];
    const isCompleted = completedWires.includes(wire.id);
    
    let rightEndpoint = null;
    if (isConnected) {
      const rightElement = document.querySelector(`[data-id="${connections[wire.id].rightId}"]`);
      if (rightElement) {
        const rect = rightElement.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        rightEndpoint = {
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top + rect.height / 2
        };
      }
    }
    
    const leftEndpoint = {
      x: 30,
      y: 50 + COLORS.indexOf(wire.color) * 60
    };
    
    return (
      <g key={wire.id}>
        {/* The wire */}
        {isConnected && rightEndpoint && (
          <path
            d={`M ${leftEndpoint.x} ${leftEndpoint.y} C ${100} ${leftEndpoint.y}, ${rightEndpoint.x - 100} ${rightEndpoint.y}, ${rightEndpoint.x} ${rightEndpoint.y}`}
            stroke={wire.color}
            strokeWidth={8}
            fill="none"
            strokeLinecap="round"
            className={isCompleted ? 'completed-wire' : ''}
          />
        )}
        
        {isSelected && (
          <path
            d={`M ${leftEndpoint.x} ${leftEndpoint.y} C ${100} ${leftEndpoint.y}, ${dragPosition.x - 100} ${dragPosition.y}, ${dragPosition.x} ${dragPosition.y}`}
            stroke={wire.color}
            strokeWidth={8}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={isCompleted ? "none" : "5,5"}
          />
        )}
        
        {/* Left endpoint (circular connector) */}
        <circle
          cx={leftEndpoint.x}
          cy={leftEndpoint.y}
          r={15}
          fill={wire.color}
          stroke="#333"
          strokeWidth={2}
          className={`left-endpoint ${isCompleted ? 'completed' : ''}`}
          onMouseDown={() => handleWireMouseDown(wire)}
          style={{ cursor: isCompleted ? 'default' : 'pointer' }}
        />
      </g>
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg h-96 shadow-lg relative">
        {/* Close button */}
        <button 
          className="absolute top-2 right-2 text-white hover:text-red-500"
          onClick={onClose}
        >
          ✕
        </button>
        
        {/* Game title */}
        <div className="text-center text-white text-lg font-bold mb-4">
          Fix Wiring
        </div>
        
        <div 
          ref={containerRef}
          className="relative w-full h-full"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* SVG container for wires */}
          <svg className="w-full h-full" style={{ overflow: 'visible' }}>
            {/* Render wires */}
            {wires.map(renderWire)}
            
            {/* Left labels */}
            {COLORS.map((color, index) => (
              <text
                key={`left-label-${color}`}
                x={55}
                y={55 + index * 60}
                className="text-white text-sm"
                fill="white"
              >
                {color.charAt(0).toUpperCase() + color.slice(1)}
              </text>
            ))}
            
            {/* Right endpoints */}
            {wires.map((wire, index) => {
              // Use the correct color's position for the right endpoint
              const rightColorIndex = COLORS.indexOf(wire.rightColor);
              const yPos = 50 + rightColorIndex * 60;
              
              return (
                <g key={`right-${wire.rightColor}`}>
                  <circle
                    cx={containerRef.current ? containerRef.current.clientWidth - 30 : 400}
                    cy={yPos}
                    r={15}
                    fill={wire.rightColor}
                    stroke="#333"
                    strokeWidth={2}
                    className="right-endpoint"
                    data-id={`right-${wire.rightColor}`}
                  />
                  <text
                    x={containerRef.current ? containerRef.current.clientWidth - 60 : 370}
                    y={yPos + 5}
                    className="text-white text-sm"
                    fill="white"
                  >
                    {wire.rightColor.charAt(0).toUpperCase() + wire.rightColor.slice(1)}
                  </text>
                </g>
              );
            })}
          </svg>
          
          {/* Game completed overlay */}
          {gameComplete && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-lg">
              <div className="text-center">
                <div className="text-green-400 text-3xl font-bold mb-4">Power Restored!</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WirePuzzle;
