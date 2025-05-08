import { useState } from 'react';

export default function TileGrid() {
  // Create a 6x6 grid with numbers from 1-36
  const [tiles] = useState(
    Array.from({ length: 6 }, (_, rowIndex) => 
      Array.from({ length: 6 }, (_, colIndex) => rowIndex * 6 + colIndex + 1)
    )
  );
  
  const [selectedTile, setSelectedTile] = useState(null);
  
  const handleTileClick = (rowIndex, colIndex) => {
    setSelectedTile({ row: rowIndex, col: colIndex });
    console.log(`Tile clicked: ${tiles[rowIndex][colIndex]}`);
  };

  return (
    <div className="flex flex-col items-center p-6 bg-transparent rounded-lg">
      <div className="grid grid-cols-6 gap-4">
        {tiles.map((row, rowIndex) => 
          row.map((number, colIndex) => (
            <div 
              key={`${rowIndex}-${colIndex}`}
              className={`flex items-center justify-center rounded-lg shadow-md w-16 h-16 text-xl font-semibold cursor-pointer transition-all ${
                selectedTile && selectedTile.row === rowIndex && selectedTile.col === colIndex
                  ? 'bg-blue-500 text-white bg-opacity-50'
                  : 'bg-white hover:bg-blue-100 bg-opacity-20 hover:bg-opacity-30'
              }`}
              onClick={() => handleTileClick(rowIndex, colIndex)}
            >
              {number}
            </div>
          ))
        )}
      </div>
    </div>
  );
}