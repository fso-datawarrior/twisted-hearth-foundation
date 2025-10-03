import { createContext, useContext, useState, useRef, useEffect, ReactNode } from "react";
import { useLocation } from "react-router-dom";

interface AudioContextType {
  isMuted: boolean;
  toggleMute: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider = ({ children }: { children: ReactNode }) => {
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const location = useLocation();

  useEffect(() => {
    // Determine which audio file to play based on route
    let audioFile: string | null = null;
    
    if (location.pathname === "/") {
      audioFile = "/sounds/scary-night-complete-19494.mp3";
    } else if (location.pathname === "*" || !location.pathname.match(/^\/(about|vignettes|schedule|costumes|feast|rsvp|gallery|discussion|contact|auth|test|admin)$/)) {
      // 404 page or unmatched routes
      audioFile = "/sounds/howl.mp3";
    }
    // All other pages: no audio (audioFile remains null)

    // Clean up previous audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }

    // If we should play audio on this route
    if (audioFile) {
      const audio = new Audio(audioFile);
      audio.volume = isMuted ? 0 : 0.3;
      audio.loop = true;
      audioRef.current = audio;

      // Auto-play with user interaction handling
      audio.play().catch(() => {
        console.log("Audio auto-play blocked by browser");
      });
    } else {
      audioRef.current = null;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, [location.pathname, isMuted]);

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = 0.3;
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.volume = 0;
      }
      setIsMuted(!isMuted);
    }
  };

  return (
    <AudioContext.Provider value={{ isMuted, toggleMute }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within AudioProvider");
  }
  return context;
};
