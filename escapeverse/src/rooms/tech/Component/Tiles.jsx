import { useState, useEffect } from 'react';
import { useGame } from '../../GameProvider';

export default function TileGrid() {
  // Store pattern types along with the numbers
  const [patternDescriptions, setPatternDescriptions] = useState([]);
  const [revealedPatterns, setRevealedPatterns] = useState({});
  const [userGuesses, setUserGuesses] = useState({});
  const [correctGuesses, setCorrectGuesses] = useState({});
  const {generatedPattern, setGeneratedPattern, hiddenTiles, setHiddenTiles} = useGame();
  const [passcode, setPasscode] = useState('');
  const {wall4code, setWall4Code} = useGame();


  // Generate logical sequence patterns for each row
  const generateSequencePatterns = () => {
    const patterns = [];
    const descriptions = [];

    // Different pattern types for rows - all with logical sequences that can be guessed
    const patternGenerators = [
      // Arithmetic sequence with constant difference
      () => {
        const start = Math.floor(Math.random() * 10) + 1;
        const difference = Math.floor(Math.random() * 5) + 2;
        const numbers = [];
        for (let i = 0; i < 6; i++) {
          numbers.push(start + (difference * i));
        }
        return {
          numbers,
          description: `Arithmetic Sequence: Each number increases by ${difference} (starting from ${start}).`
        };
      },

      // Geometric sequence (multiply by constant)
      () => {
        const start = Math.floor(Math.random() * 3) + 1;
        const multiplier = Math.floor(Math.random() * 2) + 2;
        const numbers = [];
        let current = start;
        for (let i = 0; i < 6; i++) {
          numbers.push(current);
          current *= multiplier;
        }
        return {
          numbers,
          description: `Geometric Sequence: Each number is multiplied by ${multiplier} (starting from ${start}).`
        };
      },

      // Triangular numbers sequence
      () => {
        const offset = Math.floor(Math.random() * 10);
        const numbers = [];
        for (let i = 1; i <= 6; i++) {
          // Formula for triangular numbers: n(n+1)/2
          numbers.push((i * (i + 1)) / 2 + offset);
        }
        return {
          numbers,
          description: `Triangular Numbers ${offset > 0 ? '+ ' + offset : ''}: Each number follows n(n+1)/2 pattern${offset > 0 ? ' plus ' + offset : ''}.`
        };
      },

      // Square numbers sequence
      () => {
        const offset = Math.floor(Math.random() * 5);
        const multiplier = Math.floor(Math.random() * 2) + 1;
        const numbers = [];
        for (let i = 1; i <= 6; i++) {
          numbers.push(multiplier * (i * i) + offset);
        }
        return {
          numbers,
          description: `Square Numbers ${multiplier > 1 ? '× ' + multiplier : ''}${offset > 0 ? ' + ' + offset : ''}: Each number is ${multiplier > 1 ? multiplier + ' times ' : ''}n²${offset > 0 ? ' plus ' + offset : ''}.`
        };
      },

      // Fibonacci-based sequence
      () => {
        const start1 = Math.floor(Math.random() * 5) + 1;
        const start2 = Math.floor(Math.random() * 5) + start1 + 1;
        const numbers = [start1, start2];
        for (let i = 2; i < 6; i++) {
          numbers.push(numbers[i - 1] + numbers[i - 2]);
        }
        return {
          numbers,
          description: `Fibonacci-like Sequence: Each number is the sum of the two preceding ones (starting with ${start1}, ${start2}).`
        };
      },

      // Alternating addition sequence
      () => {
        const start = Math.floor(Math.random() * 10) + 1;
        const add1 = Math.floor(Math.random() * 5) + 2;
        const add2 = Math.floor(Math.random() * 5) + 2;
        const numbers = [start];
        let current = start;
        for (let i = 1; i < 6; i++) {
          current += (i % 2 === 1) ? add1 : add2;
          numbers.push(current);
        }
        return {
          numbers,
          description: `Alternating Addition: Add ${add1} then ${add2} alternately (starting from ${start}).`
        };
      },

      // Double and add/subtract sequence
      () => {
        const start = Math.floor(Math.random() * 5) + 1;
        const addValue = Math.floor(Math.random() * 3) + 1;
        const numbers = [start];
        let current = start;
        for (let i = 1; i < 6; i++) {
          current = current * 2 + addValue;
          numbers.push(current);
        }
        return {
          numbers,
          description: `Double and Add: Each number is 2 times the previous number plus ${addValue}.`
        };
      },

      // Powers of a number with offset
      () => {
        const base = Math.floor(Math.random() * 2) + 2; // 2 or 3
        const offset = Math.floor(Math.random() * 5);
        const numbers = [];
        for (let i = 0; i < 6; i++) {
          numbers.push(Math.pow(base, i) + offset);
        }
        return {
          numbers,
          description: `Powers of ${base}${offset > 0 ? ' + ' + offset : ''}: Each number is ${base}^position${offset > 0 ? ' plus ' + offset : ''}.`
        };
      }
    ];

    // Instead of shuffling, choose a diverse set of pattern types
    const usedIndexes = new Set();

    // Generate 6 rows of patterns
    for (let i = 0; i < 6; i++) {
      // Choose a pattern type that hasn't been used yet, if possible
      let index;
      do {
        index = Math.floor(Math.random() * patternGenerators.length);
      } while (usedIndexes.size < patternGenerators.length && usedIndexes.has(index));

      usedIndexes.add(index);

      const generator = patternGenerators[index];
      const result = generator();
      patterns.push(result.numbers);
      descriptions.push(result.description);
    }

    return { patterns, descriptions };
  };

  // Hidden tiles information (which tiles are hidden in each row)
  //const [hiddenTiles, setHiddenTiles] = useState([]);

  // Initialize tiles with logical sequence patterns
  const [tiles, setTiles] = useState([]);

  useEffect(() => {
    let currentPattern;
    if (generatedPattern) {
      currentPattern = generatedPattern;
    } else {
      currentPattern = generateSequencePatterns();
      setGeneratedPattern(currentPattern);
    }

    const { patterns, descriptions } = currentPattern;
    setTiles(patterns);
    setPatternDescriptions(descriptions);
    setRevealedPatterns({});

    // Generate exactly one hidden tile per row
    const hidden = patterns.map((row, rowIndex) => {
      const minPosition = descriptions[rowIndex].includes('Fibonacci') ? 2 : 0;
      const pos = Math.floor(Math.random() * (6 - minPosition)) + minPosition;
      return [pos];
    });

    if(hiddenTiles.length === 0) {
      setHiddenTiles(hidden);
    }
    setUserGuesses({});
    setCorrectGuesses({});
  }, [generatedPattern]);

  // Add this useEffect after the tiles initialization useEffect
  useEffect(() => {
    if (tiles.length > 0 && hiddenTiles.length > 0) {
      // Get all hidden numbers in order
      const code = hiddenTiles
        .map((positions, rowIndex) => 
          positions.map(colIndex => tiles[rowIndex][colIndex]).join('')
        )
        .join('');
      
      setWall4Code(code);
      setPasscode(code);
      console.log('Hidden Tiles Passcode:', code);
    }
  }, [tiles, hiddenTiles]);

  // Reveal a pattern description
  const revealPattern = (rowIndex) => {
    setRevealedPatterns(prev => ({
      ...prev,
      [rowIndex]: true
    }));
  };

  // Handle user input for guesses
  const handleGuessChange = (rowIndex, colIndex, value) => {
    const key = `${rowIndex}-${colIndex}`;
    const numValue = parseInt(value) || '';

    setUserGuesses(prev => ({
      ...prev,
      [key]: numValue
    }));

    // Check if the guess is correct
    if (numValue === tiles[rowIndex][colIndex]) {
      setCorrectGuesses(prev => ({
        ...prev,
        [key]: true
      }));
    } else {
      setCorrectGuesses(prev => {
        const newCorrect = { ...prev };
        delete newCorrect[key];
        return newCorrect;
      });
    }
  };

  // Generate random rotation for tiles (subtle)
  const getRandomRotation = () => {
    return Math.random() * 2 - 1; // Between -1 and 1 degrees
  };

  if (tiles.length === 0) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center p-8 bg-gray-900 rounded-lg">
      {tiles.map((row, rowIndex) => (
        <div key={`row-${rowIndex}`} className="mb-6 w-full">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 mr-2 flex items-center justify-center bg-gray-800 rounded-full text-white font-mono text-sm">
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
          <div className="grid grid-cols-6 gap-3">
            {row.map((number, colIndex) => {
              const isHidden = hiddenTiles[rowIndex]?.includes(colIndex);
              const key = `${rowIndex}-${colIndex}`;
              const userGuess = userGuesses[key];
              const isCorrect = correctGuesses[key];

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className="relative flex items-center justify-center w-16 h-16 text-2xl transition-all duration-300"
                  style={{
                    transform: `rotate(${getRandomRotation()}deg)`,
                    transformOrigin: 'center',
                  }}
                >
                  {/* Tile base with 3D effect - dark theme */}
                  <div className={`absolute inset-0 rounded-md ${isHidden && isCorrect ? 'bg-gradient-to-br from-green-800 to-green-900' : 'bg-gradient-to-br from-gray-900 to-gray-800'} shadow-xl`} style={{
                    boxShadow: '0 4px 8px rgba(0,0,0,0.5), inset 0 1px 3px rgba(255,255,255,0.1), inset 0 -2px 2px rgba(0,0,0,0.3)',
                  }}>
                    {/* Tile texture overlay */}
                    <div className="absolute inset-0 opacity-10 mix-blend-overlay"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23FFFFFF' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                      }}
                    />

                    {/* Edge highlight */}
                    <div className="absolute inset-0 rounded-md opacity-30" style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.1) 100%)'
                    }} />

                    {/* Inner border */}
                    <div className="absolute inset-0.5 rounded-md border border-black border-opacity-30" />

                    {/* Inset effect */}
                    <div className="absolute inset-0 rounded-md opacity-50" style={{
                      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)'
                    }} />
                  </div>

                  {/* Number or Input */}
                  {isHidden ? (
                    <input
                      type="text"
                      value={userGuess}
                      onChange={(e) => handleGuessChange(rowIndex, colIndex, e.target.value)}
                      className={`relative z-10 w-10 h-10 text-center rounded-md bg-gray-800 border ${isCorrect ? 'text-green-400 border-green-400' : 'text-gray-200 border-gray-600'
                        }`}
                      style={{
                        fontFamily: "'Courier Prime', monospace",
                        fontWeight: 'bold',
                        outline: 'none',
                      }}
                    />
                  ) : (
                    <span className="relative z-10 text-green-400" style={{
                      fontFamily: "'Courier Prime', monospace",
                      fontWeight: 'bold',
                      textShadow: '0 0 8px rgba(74, 222, 128, 0.6), 0 0 2px rgba(255,255,255,0.3)',
                      letterSpacing: '0.5px',
                      fontVariantNumeric: 'tabular-nums'
                    }}>
                      {number}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex gap-4">
        <button
          onClick={() => {
            // Reveal all answers by filling in correct values
            const newGuesses = {};
            const newCorrect = {};

            hiddenTiles.forEach((positions, rowIndex) => {
              positions.forEach(colIndex => {
                const key = `${rowIndex}-${colIndex}`;
                newGuesses[key] = tiles[rowIndex][colIndex];
                newCorrect[key] = true;
              });
            });

            setUserGuesses(newGuesses);
            setCorrectGuesses(newCorrect);
          }}
          className="px-4 py-2 bg-gray-800 text-gray-200 rounded-md hover:bg-gray-700 transition-colors mt-4 text-sm font-mono shadow-lg"
          style={{
            fontFamily: "'Courier Prime', monospace",
            boxShadow: '0 4px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
          }}
        >
          Show Answers
        </button>
      </div>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap');
      `}</style>
    </div>
  );
}