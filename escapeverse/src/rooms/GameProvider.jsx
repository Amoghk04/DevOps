import { createContext, useContext, useState, useEffect } from 'react';
import { generateCircuit } from './tech/Component/LogicGates';

const GameContext = createContext();

export function GameProvider({ children }) {
  const [isDark, setIsDark] = useState(true);
  const [isPowerOn, setIsPowerOn] = useState(false);

  const [wall1GatePositions, setWall1GatePositions] = useState([]);
  const [wall2GatePositions, setWall2GatePositions] = useState([]);
  const [wall3GatePositions, setWall3GatePositions] = useState([]);
  const [wall4GatePositions, setWall4GatePositions] = useState([]);

  const [gateCircuits, setGateCircuits] = useState({});

  const getOrCreateCircuit = (gateNumber) => {
    if (!gateCircuits[gateNumber]) {
      const newCircuit = generateCircuit();
      setGateCircuits(prev => ({
        ...prev,
        [gateNumber]: newCircuit
      }));
      return newCircuit;
    }
    return gateCircuits[gateNumber];
  };

  useEffect(() => {
    const navType = performance.getEntriesByType("navigation")[0]?.type;
    if (navType === "reload") {
      setIsPowerOn(false); // Reset only on refresh
    }
  }, []);

  return (
    <GameContext.Provider value={{
      isDark,
      setIsDark,
      isPowerOn,
      setIsPowerOn,
      wall1GatePositions,
      setWall1GatePositions,
      wall2GatePositions,
      setWall2GatePositions,
      wall3GatePositions,
      setWall3GatePositions,
      wall4GatePositions,
      setWall4GatePositions,
      gateCircuits,
      getOrCreateCircuit,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}