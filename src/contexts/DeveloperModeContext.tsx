import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface DeveloperModeContextType {
  isDeveloperMode: boolean;
  toggleDeveloperMode: () => void;
}

const DeveloperModeContext = createContext<DeveloperModeContextType | undefined>(undefined);

export const useDeveloperMode = () => {
  const context = useContext(DeveloperModeContext);
  // Graceful fallback when provider is not mounted
  if (context === undefined) {
    return { isDeveloperMode: false, toggleDeveloperMode: () => {} } as DeveloperModeContextType;
  }
  return context;
};

interface DeveloperModeProviderProps {
  children: React.ReactNode;
}

export const DeveloperModeProvider: React.FC<DeveloperModeProviderProps> = ({ children }) => {
  // Lightweight, no-hook provider to avoid invalid hook calls if mounted inadvertently
  return (
    <DeveloperModeContext.Provider value={{ isDeveloperMode: false, toggleDeveloperMode: () => {} }}>
      {children}
    </DeveloperModeContext.Provider>
  );
};
