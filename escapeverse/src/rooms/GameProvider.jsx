import { createContext, useContext, useState, useEffect } from 'react';

const GameContext = createContext();

export function GameProvider({ children }) {
  // Initialize isDark from localStorage or default to true if not set
  const [isDark, setIsDark] = useState(() => {
    const savedLightState = localStorage.getItem('gameIsDark');
    return savedLightState === null ? true : JSON.parse(savedLightState);
  });

  // Add state for gate positions for each wall
  const [wall1GatePositions, setWall1GatePositions] = useState([]);
  const [wall2GatePositions, setWall2GatePositions] = useState([]);
  const [wall3GatePositions, setWall3GatePositions] = useState([]);
  const [wall4GatePositions, setWall4GatePositions] = useState([]);

  // Create a wrapped setIsDark function that also updates localStorage
  const handleSetIsDark = (value) => {
    const newValue = typeof value === 'function' ? value(isDark) : value;
    setIsDark(newValue);
    localStorage.setItem('gameIsDark', JSON.stringify(newValue));
  };

  // Effect to sync light state across tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'gameIsDark') {
        setIsDark(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <GameContext.Provider value={{ 
      isDark, 
      setIsDark: handleSetIsDark, // Use the wrapped function instead
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