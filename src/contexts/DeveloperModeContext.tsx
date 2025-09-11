import React, { createContext, useContext, useState, useEffect } from 'react';

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
  const [isDeveloperMode, setIsDeveloperMode] = useState(() => {
    // Check localStorage for saved developer mode preference
    const saved = localStorage.getItem('developerMode');
    return saved === 'true';
  });

  const toggleDeveloperMode = () => {
    setIsDeveloperMode(prev => {
      const newValue = !prev;
      localStorage.setItem('developerMode', newValue.toString());
      return newValue;
    });
  };

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
  }, []);

  return (
    <DeveloperModeContext.Provider value={{ isDeveloperMode, toggleDeveloperMode }}>
      {children}
    </DeveloperModeContext.Provider>
  );
};
