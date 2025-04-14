// src/UserContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

// Create context with default value
export const UserContext = createContext({ user: null, loading: false });

// Modified provider that accepts an optional value prop for testing
export function UserProvider({ children, value }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only set up Firebase auth if we're not using a provided value
    if (!value) {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // If value is provided (in tests), skip Firebase auth
      setLoading(false);
    }
  }, [value]);

  // Use provided value in tests, or internal state in real app
  const contextValue = value || { user, loading };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook remains unchanged
export const useUser = () => useContext(UserContext);
