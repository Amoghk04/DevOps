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
  const [hiddenTiles, setHiddenTiles] = useState([]);
  const [isWindowClosed, setIsWindowClosed] = useState(true);
  const [cornerLights, setCornerLights] = useState([false, false, false, false]);
  const [gatesSolved, setGatesSolved] = useState([false, false, false, false]);
  const [server2Code, setServer2Code] = useState('');
  const [wall3code, setWall3Code] = useState(''); // Assuming this is needed for Wall 3
  const [wall4code, setWall4Code] = useState(''); // Assuming this is needed for Wall 4
  const [isRoomOpened, setIsRoomOpened] = useState(false); // New state for wall opening

  const audioRef = useRef(null); // New ref for audio
  const errorAudioRef = useRef(null); // New ref for error sound
  const onlineAudioRef = useRef(null); // New ref for online sound
  const wireAudioRef = useRef(null); // New ref for wire sound
  const gateSolveAudioRef = useRef(null); // New ref for gate solve sound
  const lightOnAudioRef = useRef(null); // New ref for light on sound
  const windowsOnAudioRef = useRef(null); // New ref for windows on sound
  const windowsOffAudioRef = useRef(null); // New ref for windows off sound

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

  const playGateSolveSound = () => {
    if (gateSolveAudioRef.current) {
      gateSolveAudioRef.current.currentTime = 0; // Rewind to start
      gateSolveAudioRef.current.play().catch((e) => {
        console.log("GateSolve sound failed to play:", e);
      });
    }
  };

  const playOnlineSound = () => {
    if (onlineAudioRef.current) {
      onlineAudioRef.current.currentTime = 0; // Rewind to start
      onlineAudioRef.current.play().catch((e) => {
        console.log("Online sound failed to play:", e);
      });
    }
  };

  const playWireSound = () => {
    if (wireAudioRef.current) {
      wireAudioRef.current.loop = true; // Loop the music
      wireAudioRef.current.play().catch((e) => {
        console.log("Wire sound failed to play:", e);
      });
    }
  };

  const stopWireSound = () => {
    if (wireAudioRef.current) {
      wireAudioRef.current.pause(); 
      wireAudioRef.current.currentTime = 0; 
    }
  };

  const playErrorSound = () => {
    if (errorAudioRef.current) {
      errorAudioRef.current.currentTime = 0; // Rewind to start
      errorAudioRef.current.play().catch((e) => {
        console.log("Error sound failed to play:", e);
      });
    }
  };

  const playLightOnSound = () => {
    if (lightOnAudioRef.current) {
      lightOnAudioRef.current.currentTime = 0; // Rewind to start
      lightOnAudioRef.current.play().catch((e) => {
        console.log("LightOn sound failed to play:", e);
      });
    }
  };

  const playWindowsOffSound = () => {
    if (windowsOffAudioRef.current) {
      windowsOffAudioRef.current.currentTime = 0; // Rewind to start
      windowsOffAudioRef.current.play().catch((e) => {
        console.log("WindowsOff sound failed to play:", e);
      });
    }
  };

  const playWindowsOnSound = () => {
    if (windowsOnAudioRef.current) {
      windowsOnAudioRef.current.currentTime = 0; // Rewind to start
      windowsOnAudioRef.current.play().catch((e) => {
        console.log("WindowsOn sound failed to play:", e);
      });
    }
  };

  const updateCornerLight = (index) => {
    setCornerLights(prev => {
      const newLights = [...prev];
      newLights[index] = true;
      return newLights;
    });
  };

  // Reset corner lights when room light is turned on
  useEffect(() => {
    if (!isDark) {
      setCornerLights([false, false, false, false]);
    } 
  }, [isDark]);

  useEffect(() => {
    const navType = performance.getEntriesByType("navigation")[0]?.type;
    if (navType === "reload") {
      setIsPowerOn(false);
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
      audioRef.current.loop = true; // Ensure it loops
      audioRef.current.play().catch((e) => {
        console.log("Autoplay failed:", e);
      });
    }
  }, []);

  const updateGateSolved = (gateIndex) => {
    setGatesSolved(prev => {
      const newSolved = [...prev];
      newSolved[gateIndex] = true;
      // Update corner light when gate is solved
      updateCornerLight(gateIndex);
      return newSolved;
    });
  };

  const value = {
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
    hiddenTiles,
    setHiddenTiles,
    wall3code,
    setWall3Code,
    wall4code,  
    setWall4Code,
    isWindowClosed,
    setIsWindowClosed,
    isRoomOpened,
    setIsRoomOpened,
    isBgmPlaying,
    playBackgroundMusic,
    playErrorSound,
    playOnlineSound,
    playWireSound,
    stopWireSound,
    playGateSolveSound,
    playLightOnSound,
    playWindowsOnSound,
    playWindowsOffSound,
    cornerLights,
    updateCornerLight,
    gatesSolved,
    updateGateSolved,
    server2Code,
    setServer2Code
  };

  return (
    <GameContext.Provider value={value}>
      {/* Audio element */}
      <audio ref={audioRef} src="/bgm.mp3" />
      <audio ref={errorAudioRef} src="/error.mp3" />
      <audio ref={onlineAudioRef} src="/online.mp3" />
      <audio ref={wireAudioRef} src="/wire.mp3" />
      <audio ref={gateSolveAudioRef} src="/gateSolve.mp3" />
      <audio ref={lightOnAudioRef} src="/lightOn.mp3" />
      <audio ref={windowsOnAudioRef} src="/windowsOn.mp3" />
      <audio ref={windowsOffAudioRef} src="/windowsOff.mp3" />
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}