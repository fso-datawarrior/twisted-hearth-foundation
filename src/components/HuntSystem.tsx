import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Hunt Hint Component with Modern CSS Features
interface HuntHintProps {
  id: string;
  hint: string;
  found: boolean;
  onFound: (id: string) => void;
  className?: string;
  children: React.ReactNode;
}

export const HuntHint: React.FC<HuntHintProps> = ({
  id,
  hint,
  found,
  onFound,
  className = '',
  children
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const hintRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    if (!found) {
      onFound(id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      ref={hintRef}
      className={`
        hunt-hint container-inline
        ${found ? 'hunt-hint--interactive' : ''}
        ${className}
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      tabIndex={0}
      role="button"
      aria-label={`Hunt hint: ${hint}`}
      aria-pressed={found}
    >
      <div className="hunt-hint__content">
        {children}
        <AnimatePresence>
          {(isHovered || isFocused) && !found && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/90 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap z-50"
            >
              {hint}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Hunt Progress Ring Component with CSS Houdini
interface HuntProgressProps {
  found: number;
  total: number;
  className?: string;
}

export const HuntProgress: React.FC<HuntProgressProps> = ({
  found,
  total,
  className = ''
}) => {
  const progress = total > 0 ? found / total : 0;
  const percentage = Math.round(progress * 100);

  useEffect(() => {
    // Register the paint worklet
    if ('paintWorklet' in CSS) {
      CSS.paintWorklet.addModule('/src/hunt-progress-paint.js').catch(console.error);
    }
  }, []);

  return (
    <div className={`hunt-progress-ring ${className}`} style={{
      '--progress': progress,
      '--color': '#3B6E47',
      '--size': '60px',
      '--thickness': '4px',
      '--background-color': '#1A1F3A',
      '--progress-color': '#3B6E47'
    }}>
      <div className="sr-only">
        Hunt Progress: {found} of {total} hints found ({percentage}%)
      </div>
    </div>
  );
};

// Hunt Modal Component with Modern CSS
interface HuntModalProps {
  isOpen: boolean;
  onClose: () => void;
  rewardMessage: string;
  found: number;
  total: number;
}

export const HuntModal: React.FC<HuntModalProps> = ({
  isOpen,
  onClose,
  rewardMessage,
  found,
  total
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="hunt-modal absolute inset-0" />
        <motion.div
          ref={modalRef}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="relative bg-card text-card-foreground rounded-lg p-8 max-w-md w-full focus-ring"
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground focus-ring"
            aria-label="Close modal"
          >
            ✕
          </button>
          
          <div className="text-center">
            <h2 className="text-2xl font-heading mb-4">
              {found === total ? 'Hunt Complete!' : 'Hunt Progress'}
            </h2>
            
            <HuntProgress found={found} total={total} className="mx-auto mb-6" />
            
            <p className="text-muted-foreground mb-6">
              {found} of {total} hints found
            </p>
            
            {found === total && (
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-6">
                <p className="text-accent font-subhead">
                  {rewardMessage}
                </p>
              </div>
            )}
            
            <button
              onClick={onClose}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 focus-ring"
            >
              {found === total ? 'Continue Exploring' : 'Keep Hunting'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Main Hunt System Hook
export const useHuntSystem = () => {
  const [foundHints, setFoundHints] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rewardMessage, setRewardMessage] = useState('');

  const totalHints = 15;
  const found = foundHints.length;

  const rewardMessages = [
    "You turned every page and uncovered every secret. Now the story wants something in return...",
    "Congratulations, sleuth! You've officially spent way too much time on this website. Your prize? Bragging rights… and maybe a poisoned apple.",
    "The tale doesn't end here. At the party, you'll find what the hints were hiding all along. Don't be late — the feast won't wait.",
    "Once upon a time, a guest found every clue. They lived happily never after.",
    "You found them all. Ready for the real horror? The party awaits..."
  ];

  const markHintFound = (hintId: string) => {
    if (!foundHints.includes(hintId)) {
      setFoundHints(prev => [...prev, hintId]);
      
      // Check if all hints are found
      if (foundHints.length + 1 === totalHints) {
        setRewardMessage(rewardMessages[Math.floor(Math.random() * rewardMessages.length)]);
        setTimeout(() => setIsModalOpen(true), 500);
      }
    }
  };

  const resetHunt = () => {
    setFoundHints([]);
    setIsModalOpen(false);
  };

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('twisted-hunt-progress');
    if (saved) {
      try {
        setFoundHints(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load hunt progress:', e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('twisted-hunt-progress', JSON.stringify(foundHints));
  }, [foundHints]);

  return {
    foundHints,
    found,
    total: totalHints,
    isModalOpen,
    rewardMessage,
    markHintFound,
    resetHunt,
    setIsModalOpen
  };
};
