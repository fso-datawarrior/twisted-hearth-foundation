import React, { createContext, useContext, useState, ReactNode } from 'react';
import SupportReportModal from '@/components/SupportReportModal';

interface SupportModalContextType {
  isOpen: boolean;
  openSupportModal: () => void;
  closeSupportModal: () => void;
}

const SupportModalContext = createContext<SupportModalContextType | undefined>(undefined);

export const useSupportModal = () => {
  const context = useContext(SupportModalContext);
  if (context === undefined) {
    throw new Error('useSupportModal must be used within a SupportModalProvider');
  }
  return context;
};

interface SupportModalProviderProps {
  children: ReactNode;
}

export const SupportModalProvider: React.FC<SupportModalProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openSupportModal = () => setIsOpen(true);
  const closeSupportModal = () => setIsOpen(false);

  return (
    <SupportModalContext.Provider value={{ isOpen, openSupportModal, closeSupportModal }}>
      {children}
      <SupportReportModal isOpen={isOpen} onClose={closeSupportModal} />
    </SupportModalContext.Provider>
  );
};
