import { createContext, useContext, useState } from 'react';

const GameContext = createContext();

export function GameProvider({ children }) {
  const [isDark, setIsDark] = useState(true);
  // Add state for gate positions for each wall
  const [wall1GatePositions, setWall1GatePositions] = useState([]);
  const [wall2GatePositions, setWall2GatePositions] = useState([]);
  const [wall3GatePositions, setWall3GatePositions] = useState([]);
  const [wall4GatePositions, setWall4GatePositions] = useState([]);

  return (
    <GameContext.Provider value={{ 
      isDark, 
      setIsDark,
      wall1GatePositions,
      setWall1GatePositions,
      wall2GatePositions,
      setWall2GatePositions,
      wall3GatePositions,
      setWall3GatePositions,
      wall4GatePositions,
      setWall4GatePositions
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}