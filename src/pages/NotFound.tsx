import { useLocation, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Volume2, VolumeX } from "lucide-react";
import { FloatingGhosts } from "@/components/FloatingGhost";

const NotFound = () => {
  const location = useLocation();
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    
    // Try to play spooky sound (if available)
    // Note: Audio file needs to be added to public/sounds/howl.mp3
    const audio = new Audio("/sounds/howl.mp3");
    audio.volume = 0.3;
    audio.loop = true;
    audioRef.current = audio;

    // Auto-play with user interaction handling
    const playAudio = () => {
      audio.play().catch(() => {
        // Browser blocked auto-play, that's okay
        console.log("Audio auto-play blocked by browser");
      });
    };

    playAudio();

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [location.pathname]);

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
    <div className="relative flex min-h-screen items-center justify-center bg-background overflow-hidden">
      {/* Floating Ghosts */}
      <FloatingGhosts />

      {/* Mute Button */}
      <button
        onClick={toggleMute}
        className="fixed top-4 right-4 z-50 p-3 rounded-full bg-card/60 backdrop-blur-sm border border-accent/40 hover:bg-accent/10 transition-all"
        aria-label={isMuted ? "Unmute sound" : "Mute sound"}
      >
        {isMuted ? (
          <VolumeX className="h-5 w-5 text-foreground" />
        ) : (
          <Volume2 className="h-5 w-5 text-accent" />
        )}
      </button>

      <div className="mx-4 max-w-2xl z-20 relative">
        <div className="rounded-xl border border-[rgba(212,175,55,0.4)] bg-card/60 backdrop-blur-sm p-8 md:p-12 text-center shadow-[0_8px_32px_rgba(212,175,55,0.2)]">
          {/* Arcade 404 Image */}
          <div className="mb-6 flex justify-center">
            <img 
              src="/img/arcade-404.png" 
              alt="Arcade style 404 error" 
              className="max-w-full h-auto max-h-48 md:max-h-64 drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]"
            />
          </div>
          
          {/* 404 Number */}
          <h1 className="mb-4 text-5xl md:text-7xl font-heading font-bold text-accent text-shadow-gothic">
            Lost in the Game
          </h1>
          
          {/* Message */}
          <h2 className="mb-3 text-2xl md:text-3xl font-heading text-foreground">
            Lost in the Enchanted Forest?
          </h2>
          <p className="mb-8 text-base md:text-lg text-muted-foreground">
            This path leads to nowhere... Perhaps you should return to the realm.
          </p>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/">
              <Button 
                className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold shadow-[0_0_20px_rgba(197,164,93,0.3)] hover:shadow-[0_0_30px_rgba(197,164,93,0.5)] transition-all"
              >
                <Home className="h-4 w-4" />
                Return Home
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
              className="gap-2 border-accent/40 text-foreground hover:bg-accent/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          </div>

          {/* Decorative element */}
          <p className="mt-8 text-sm text-muted-foreground/60 italic">
            "Not all who wander are lost... but you definitely are."
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
