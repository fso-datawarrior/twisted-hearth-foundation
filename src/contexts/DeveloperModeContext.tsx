import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface DeveloperModeContextType {
  isDeveloperMode: boolean;
  toggleDeveloperMode: () => void;
}

const DeveloperModeContext = createContext<DeveloperModeContextType | undefined>(undefined);

export const useDeveloperMode = () => {
  const context = useContext(DeveloperModeContext);
  if (context === undefined) {
    throw new Error('useDeveloperMode must be used within a DeveloperModeProvider');
  }
  return context;
};

interface DeveloperModeProviderProps {
  children: React.ReactNode;
}

export const DeveloperModeProvider: React.FC<DeveloperModeProviderProps> = ({ children }) => {
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);

  // Initialize from localStorage after component mounts - only in development
  useEffect(() => {
    // Security: Only allow developer mode in development environment
    if (import.meta.env.PROD || window.location.hostname !== 'localhost') {
      setIsDeveloperMode(false);
      localStorage.removeItem('developerMode');
      return;
    }
    
    const saved = localStorage.getItem('developerMode');
    if (saved === 'true') {
      setIsDeveloperMode(true);
    }
  }, []);

  const toggleDeveloperMode = useCallback(() => {
    // Security: Only allow toggle in development environment
    if (import.meta.env.PROD || window.location.hostname !== 'localhost') {
      return;
    }
    
    setIsDeveloperMode(prev => {
      const newValue = !prev;
      localStorage.setItem('developerMode', newValue.toString());
      return newValue;
    });
  }, []);

  // Add keyboard shortcut for toggling dev mode (Ctrl+Shift+D)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        toggleDeveloperMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleDeveloperMode]);

  return (
    <DeveloperModeContext.Provider value={{ isDeveloperMode, toggleDeveloperMode }}>
      {children}
    </DeveloperModeContext.Provider>
  );
};
