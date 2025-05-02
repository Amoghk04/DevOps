import { createContext, useContext, useState } from 'react';

const GameContext = createContext();

export function GameProvider({ children }) {
  const [isDark, setIsDark] = useState(true);

  return (
    <GameContext.Provider value={{ isDark, setIsDark }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}