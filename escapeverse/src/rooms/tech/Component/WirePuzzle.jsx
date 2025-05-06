import { useState, useRef, useEffect } from 'react';

const WirePuzzle = ({ onComplete, onClose }) => {
  const COLORS = ['red', 'yellow', 'blue', 'green', 'purple', 'orange', 'teal', 'pink'];
  const [wires, setWires] = useState([]);
  const [selectedWire, setSelectedWire] = useState(null);
  const [connections, setConnections] = useState({});
  const [correctConnections, setCorrectConnections] = useState([]);
  const [gameComplete, setGameComplete] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Initialize the game
  useEffect(() => {
    initializeGame();
  }, []);

  // Check if game is complete
  useEffect(() => {
    if (correctConnections.length === COLORS.length && !gameComplete) {
      setGameComplete(true);
      setTimeout(() => {
        onComplete && onComplete();
      }, 1000);
    }
  }, [correctConnections, gameComplete, onComplete]);

  const initializeGame = () => {
    // Shuffle both left and right side colors/positions
    const shuffledLeftColors = [...COLORS].sort(() => Math.random() - 0.5);
    const shuffledRightColors = [...COLORS].sort(() => Math.random() - 0.5);

    const newWires = shuffledLeftColors.map((color, index) => ({
      id: `wire-${index}`,
      color,
      leftPosition: index, // Store the position index for the left side
      rightId: `right-${shuffledRightColors[index]}`,
      rightColor: shuffledRightColors[index]
    }));

    setWires(newWires);

    // Initially connect all wires 
    const initialConnections = {};
    let initialCorrectConnections = [];

    newWires.forEach(wire => {
      // Get the actual positions based on the shuffled orders
      const leftPos = getEndpointPosition('left', wire.color, wire.leftPosition);
      const rightColorIndex = COLORS.indexOf(wire.rightColor);
      const rightPos = getEndpointPosition('right', wire.rightColor, rightColorIndex);

      initialConnections[wire.id] = {
        rightId: wire.rightId,
        correct: wire.color === wire.rightColor,
        controlPoint1: {
          x: leftPos.x + 100 + Math.random() * 100,
          y: leftPos.y + (Math.random() * 300 - 150)
        },
        controlPoint2: {
          x: rightPos.x - 100 - Math.random() * 100,
          y: rightPos.y + (Math.random() * 300 - 150)
        }
      };

      if (wire.color === wire.rightColor) {
        initialCorrectConnections.push(wire.id);
      }
    });

    setConnections(initialConnections);
    setCorrectConnections(initialCorrectConnections);
  };

  const handleWireMouseDown = (wire) => {
    if (correctConnections.includes(wire.id)) return;

    // Remove existing connection when clicking on wire
    setConnections(prev => {
      const newConnections = { ...prev };
      delete newConnections[wire.id];
      return newConnections;
    });

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
      const rightColor = rightId.split('-')[1];
      const isCorrect = selectedWire.color === rightColor;

      // Get endpoint positions for control points
      const leftPos = getEndpointPosition('left', selectedWire.color, selectedWire.leftPosition);
      const rightIndex = Array.from(rightEndpoints).indexOf(hoveredEndpoint);
      const rightPos = getEndpointPosition('right', rightColor, rightIndex);

      // Connect the wire
      setConnections(prev => ({
        ...prev,
        [selectedWire.id]: {
          rightId,
          correct: isCorrect,
          // Generate new control points for the Bezier curve
          controlPoint1: {
            x: leftPos.x + 100 + Math.random() * 50,
            y: leftPos.y + (Math.random() * 200 - 100)
          },
          controlPoint2: {
            x: rightPos.x - 100 - Math.random() * 50,
            y: rightPos.y + (Math.random() * 200 - 100)
          }
        }
      }));

      if (isCorrect) {
        setCorrectConnections(prev =>
          prev.includes(selectedWire.id) ? prev : [...prev, selectedWire.id]
        );
      } else {
        setCorrectConnections(prev =>
          prev.filter(id => id !== selectedWire.id)
        );
      }
    }

    setSelectedWire(null);
  };

  const getEndpointPosition = (side, color, positionIndex = null) => {
    // If positionIndex is provided, use it. Otherwise use the color's index in the COLORS array
    const index = positionIndex !== null ? positionIndex : COLORS.indexOf(color);
    // Adjust the spacing based on number of colors
    const spacing = Math.min(60, 360 / COLORS.length);
    const yPos = 40 + index * spacing;

    if (side === 'left') {
      return {
        x: 30,
        y: yPos
      };
    } else {
      // Use a default width if containerRef isn't available yet
      const containerWidth = containerRef.current ? containerRef.current.clientWidth : 400;
      return {
        x: containerWidth - 30,
        y: yPos
      };
    }
  };

  const renderWire = (wire) => {
    const isSelected = selectedWire && selectedWire.id === wire.id;
    const connection = connections[wire.id];
    const isConnected = !!connection;
    const isCorrect = connection && connection.correct;

    // Get left endpoint using the wire's position index
    const leftEndpoint = getEndpointPosition('left', wire.color, wire.leftPosition);

    let rightEndpoint = null;
    if (isConnected) {
      const rightColor = connection.rightId.split('-')[1];
      const rightIndex = COLORS.indexOf(rightColor);
      const rightPos = getEndpointPosition('right', rightColor, rightIndex);
      rightEndpoint = rightPos;

      // If control points don't exist for this connection, create them
      if (!connection.controlPoint1 || !connection.controlPoint2) {
        connection.controlPoint1 = {
          x: leftEndpoint.x + 100 + Math.random() * 100,
          y: leftEndpoint.y + (Math.random() * 200 - 100)
        };
        connection.controlPoint2 = {
          x: rightEndpoint.x - 100 - Math.random() * 100,
          y: rightEndpoint.y + (Math.random() * 200 - 100)
        };
      }
    }
    return (
      <g key={wire.id}>
        {/* The wire */}
        {isConnected && rightEndpoint && (
          <path
            d={`M ${leftEndpoint.x} ${leftEndpoint.y} 
                C ${connection.controlPoint1.x} ${connection.controlPoint1.y}, 
                  ${connection.controlPoint2.x} ${connection.controlPoint2.y}, 
                  ${rightEndpoint.x} ${rightEndpoint.y}`}
            stroke={wire.color}
            strokeWidth={8}
            fill="none"
            strokeLinecap="round"
            className={isCorrect ? 'correct-wire' : 'incorrect-wire'}
            opacity={isCorrect ? 1 : 0.7}
          />
        )}

        {isSelected && (
          <path
            d={`M ${leftEndpoint.x} ${leftEndpoint.y} 
                C ${leftEndpoint.x + 100} ${leftEndpoint.y}, 
                  ${dragPosition.x - 100} ${dragPosition.y}, 
                  ${dragPosition.x} ${dragPosition.y}`}
            stroke={wire.color}
            strokeWidth={8}
            fill="none"
            strokeLinecap="round"
            strokeDasharray="5,5"
            opacity={0.7}
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
          className={`left-endpoint ${isCorrect ? 'completed' : ''}`}
          onMouseDown={() => handleWireMouseDown(wire)}
          style={{ cursor: isCorrect ? 'default' : 'pointer' }}
        />
      </g>
    );
  };

  // Circuit pattern elements
  const renderCircuitPatterns = () => {
    return (
      <g className="circuit-patterns" opacity="0.2">
        {/* Horizontal lines */}
        {[...Array(10)].map((_, i) => (
          <path 
            key={`h-line-${i}`}
            d={`M 0 ${30 + i * 40} H ${containerRef.current ? containerRef.current.clientWidth : 400}`}
            stroke="#0ff"
            strokeWidth="2"
            opacity="0.5"
          />
        ))}
        
        {/* Vertical lines */}
        {[...Array(8)].map((_, i) => (
          <path 
            key={`v-line-${i}`}
            d={`M ${60 + i * 50} 0 V ${containerRef.current ? containerRef.current.clientHeight : 400}`}
            stroke="#0ff"
            strokeWidth="2"
            opacity="0.5"
          />
        ))}
        
        
      </g>
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50">
      <div className="bg-gray-900 rounded-lg p-1 w-full max-w-lg h-96 shadow-2xl relative overflow-hidden border border-gray-700">
        {/* Tech background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-950">
          <div className="absolute inset-0 opacity-10">
            {[...Array(50)].map((_, i) => (
              <div
                key={`dot-${i}`}
                className="absolute bg-blue-400 rounded-full"
                style={{
                  width: `${1 + Math.random() * 3}px`,
                  height: `${1 + Math.random() * 3}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  opacity: 0.1 + Math.random() * 0.4,
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Close button */}
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-red-500 z-10"
          onClick={onClose}
        >
          ✕
        </button>
        
        <div
          ref={containerRef}
          className="relative w-full h-full"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* SVG container for wires */}
          <svg className="w-full h-full" style={{ overflow: 'visible' }}>
            {/* Circuit patterns in background */}
            {renderCircuitPatterns()}
            
            {/* Render wires */}
            {wires.map(renderWire)}

            {/* Right endpoints */}
            {COLORS.map((color, index) => {
              const position = getEndpointPosition('right', color, index);
              return (
                <g key={`right-${color}`}>
                  <circle
                    cx={position.x}
                    cy={position.y}
                    r={15}
                    fill={color}
                    stroke="#333"
                    strokeWidth={2}
                    className="right-endpoint"
                    data-id={`right-${color}`}
                  />
                  {/* Metal socket */}
                  <circle
                    cx={position.x}
                    cy={position.y}
                    r={18}
                    fill="none"
                    stroke="#555"
                    strokeWidth={3}
                    opacity={0.8}
                  />
                </g>
              );
            })}
          </svg>

          {/* Game completed overlay */}
          {gameComplete && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-lg">
              <div className="text-center">
                <div className="text-green-400 text-3xl font-bold mb-4">Power Restored!</div>
                <div className="text-cyan-300">System back online</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WirePuzzle;