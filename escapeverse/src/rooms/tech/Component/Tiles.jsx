import { useState, useEffect } from 'react';

export default function TileGrid() {
  // Store pattern types along with the numbers
  const [patternDescriptions, setPatternDescriptions] = useState([]);
  const [revealedPatterns, setRevealedPatterns] = useState({});
  
  // Generate random patterns for each row
  const generateRandomPatterns = () => {
    const patterns = [];
    const descriptions = [];
    
    // Different pattern types for rows
    const patternGenerators = [
      // Fibonacci-like sequence with random starting points
      () => {
        const start = Math.floor(Math.random() * 10) + 1;
        const sequence = [start, start + Math.floor(Math.random() * 5) + 1];
        for (let i = 2; i < 6; i++) {
          sequence.push(sequence[i-1] + sequence[i-2]);
        }
        return { 
          numbers: sequence, 
          description: "Fibonacci-like Sequence: Each number is the sum of the two preceding ones."
        };
      },
      
      // Multiple of a random number
      () => {
        const multiplier = Math.floor(Math.random() * 5) + 2;
        return { 
          numbers: Array.from({ length: 6 }, (_, i) => (i + 1) * multiplier),
          description: `Multiples of ${multiplier}: Each number increases by ${multiplier}.`
        };
      },
      
      // Powers of a random base (2-4)
      () => {
        const base = Math.floor(Math.random() * 3) + 2;
        return { 
          numbers: Array.from({ length: 6 }, (_, i) => Math.pow(base, i)),
          description: `Powers of ${base}: Each number is ${base} raised to a power (${base}^0, ${base}^1, ${base}^2, etc).`
        };
      },
      
      // Random prime numbers
      () => {
        const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
        const shuffled = [...primes].sort(() => 0.5 - Math.random());
        return { 
          numbers: shuffled.slice(0, 6),
          description: "Prime Numbers: All numbers are prime (divisible only by 1 and itself)."
        };
      },
      
      // Alternating increase/decrease pattern
      () => {
        const start = Math.floor(Math.random() * 15) + 5;
        const step = Math.floor(Math.random() * 5) + 2;
        return { 
          numbers: Array.from({ length: 6 }, (_, i) => 
            i % 2 === 0 ? start + (i * step) : start + ((i-1) * step) - Math.floor(step/2)
          ),
          description: `Alternating Pattern: Values oscillate up and down with a step of ~${step}.`
        };
      },
      
      // Mixed random numbers
      () => {
        return { 
          numbers: Array.from({ length: 6 }, () => Math.floor(Math.random() * 80) + 10),
          description: "Random Sequence: No specific pattern - remember these numbers."
        };
      }
    ];
    
    // Shuffle pattern generators
    const shuffledGenerators = [...patternGenerators].sort(() => 0.5 - Math.random());
    
    // Generate 6 rows of patterns
    for (let i = 0; i < 6; i++) {
      // Pick a pattern generator (cycling through the shuffled list)
      const generator = shuffledGenerators[i % shuffledGenerators.length];
      const result = generator();
      patterns.push(result.numbers);
      descriptions.push(result.description);
    }
    
    return { patterns, descriptions };
  };
  
  // Initialize tiles with random patterns
  const [tiles, setTiles] = useState([]);
  
  useEffect(() => {
    const { patterns, descriptions } = generateRandomPatterns();
    setTiles(patterns);
    setPatternDescriptions(descriptions);
    setRevealedPatterns({});
  }, []);
  
  const [selectedTile, setSelectedTile] = useState(null);
  
  const handleTileClick = (rowIndex, colIndex) => {
    setSelectedTile({ row: rowIndex, col: colIndex });
    console.log(`Tile clicked: ${tiles[rowIndex][colIndex]}`);
  };

  // Generate new patterns
  const regeneratePatterns = () => {
    const { patterns, descriptions } = generateRandomPatterns();
    setTiles(patterns);
    setPatternDescriptions(descriptions);
    setSelectedTile(null);
    setRevealedPatterns({});
  };
  
  // Reveal a pattern description
  const revealPattern = (rowIndex) => {
    setRevealedPatterns(prev => ({
      ...prev,
      [rowIndex]: true
    }));
  };

  if (tiles.length === 0) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center p-8 bg-transparent rounded-lg">
      {tiles.map((row, rowIndex) => (
        <div key={`row-${rowIndex}`} className="mb-6 w-full">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 mr-2 flex items-center justify-center bg-gray-700 rounded-full text-white font-mono text-sm">
              {rowIndex + 1}
            </div>
            {revealedPatterns[rowIndex] ? (
              <div className="text-gray-300 font-mono text-sm bg-gray-800 px-3 py-1 rounded-md flex-grow">
                {patternDescriptions[rowIndex]}
              </div>
            ) : (
              <button 
                className="text-gray-400 font-mono text-sm bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded-md flex-grow text-left flex items-center"
                onClick={() => revealPattern(rowIndex)}
              >
                <span className="mr-1">?</span> 
                <span>Reveal Pattern</span>
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-6 gap-4">
            {row.map((number, colIndex) => (
              <div 
                key={`${rowIndex}-${colIndex}`}
                className={`flex items-center justify-center rounded-md w-16 h-16 text-2xl cursor-pointer transition-all duration-300 transform ${
                  selectedTile && selectedTile.row === rowIndex && selectedTile.col === colIndex
                    ? 'bg-red-700 text-white shadow-lg scale-105 border-2 border-yellow-400'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 shadow-md border border-gray-600 hover:scale-105'
                }`}
                onClick={() => handleTileClick(rowIndex, colIndex)}
                style={{
                  fontFamily: "'Courier Prime', monospace",
                  textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                  backgroundImage: selectedTile && selectedTile.row === rowIndex && selectedTile.col === colIndex 
                    ? 'linear-gradient(45deg, #8B0000, #A52A2A)'
                    : 'linear-gradient(45deg, #2C3E50, #1A1A2E)',
                  boxShadow: selectedTile && selectedTile.row === rowIndex && selectedTile.col === colIndex
                    ? '0 4px 12px rgba(200, 0, 0, 0.4), inset 0 2px 6px rgba(255, 255, 255, 0.1)'
                    : '0 4px 8px rgba(0, 0, 0, 0.3), inset 0 1px 3px rgba(255, 255, 255, 0.1)'
                }}
              >
                <span className="relative" style={{ 
                  fontWeight: 'bold', 
                  letterSpacing: '1px',
                  fontVariantNumeric: 'tabular-nums'
                }}>
                  {number}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <button 
        onClick={regeneratePatterns}
        className="px-4 py-2 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition-colors mt-4 text-sm font-mono"
        style={{ fontFamily: "'Courier Prime', monospace" }}
      >
        Reset Puzzle
      </button>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap');
      `}</style>
    </div>
  );
}