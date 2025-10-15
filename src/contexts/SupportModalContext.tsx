import React, { createContext, useContext, useState, ReactNode } from 'react';
import SupportReportModal from '@/components/SupportReportModal';

interface SupportModalContextType {
  openSupportModal: () => void;
}

const SupportModalContext = createContext<SupportModalContextType | undefined>(undefined);

interface SupportModalProviderProps {
  children: ReactNode;
}

export function SupportModalProvider({ children }: SupportModalProviderProps) {
  const [showSupportModal, setShowSupportModal] = useState(false);

  const openSupportModal = () => {
    setShowSupportModal(true);
  };

  const closeSupportModal = () => {
    setShowSupportModal(false);
  };

  return (
    <SupportModalContext.Provider value={{ openSupportModal }}>
      {children}
      <SupportReportModal 
        isOpen={showSupportModal} 
        onClose={closeSupportModal} 
      />
    </SupportModalContext.Provider>
  );
}

export function useSupportModal() {
  const context = useContext(SupportModalContext);
  if (context === undefined) {
    throw new Error('useSupportModal must be used within a SupportModalProvider');
  }
  return context;
}
