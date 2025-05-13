import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { generateCircuit } from './tech/Component/LogicGates';

const GameContext = createContext();

export function GameProvider({ children }) {
  const [isDark, setIsDark] = useState(true);
  const [isPowerOn, setIsPowerOn] = useState(false);
  const [isGateActive, setIsGateActive] = useState(false);
  const [gateOutputStates, setGateOutputStates] = useState({});
  const [gateActiveStates, setGateActiveStates] = useState({});
  const [wall1GatePositions, setWall1GatePositions] = useState([]);
  const [wall2GatePositions, setWall2GatePositions] = useState([]);
  const [wall3GatePositions, setWall3GatePositions] = useState([]);
  const [wall4GatePositions, setWall4GatePositions] = useState([]);
  const [gateCircuits, setGateCircuits] = useState({});
  const [lightCode, setLightCode] = useState('');
  const [generatedPattern, setGeneratedPattern] = useState('');
  const [serverRoomKey, setServerRoomKey] = useState('');
  const [isBgmPlaying, setIsBgmPlaying] = useState(false);

  const audioRef = useRef(null); // New ref for audio

  const saveGateOutputs = (gateNumber, outputs) => {
    setGateOutputStates(prev => ({
      ...prev,
      [gateNumber]: outputs
    }));
  };

  const setGateActiveState = (gateNumber, isActive) => {
    setGateActiveStates(prev => ({
      ...prev,
      [gateNumber]: isActive
    }));
  };

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

  const playBackgroundMusic = () => {
    if (audioRef.current && !isBgmPlaying) {
      audioRef.current.volume = 0.3; // Adjust volume as needed
      audioRef.current.loop = true; // Loop the music
      audioRef.current.play().catch((e) => {
        console.log("Autoplay failed:", e);
      });
      setIsBgmPlaying(true); // Ensure it's playing and not paused
    }
  };

  useEffect(() => {
    const navType = performance.getEntriesByType("navigation")[0]?.type;
    if (navType === "reload") {
      setIsPowerOn(false);
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.loop = true; // Ensure it loops
      audioRef.current.play().catch((e) => {
        console.log("Autoplay failed:", e);
      });
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
      isGateActive,
      setIsGateActive,
      gateOutputStates,
      saveGateOutputs,
      gateActiveStates,
      setGateActiveState,
      lightCode,
      setLightCode,
      generatedPattern,
      setGeneratedPattern,
      serverRoomKey,
      setServerRoomKey,
      isBgmPlaying,
      playBackgroundMusic
    }}>
      {/* 🔊 Hidden background audio element */}
      <audio ref={audioRef} src="/bgm.mp3" />
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
