import { useEffect, useRef, useState } from "react";

type Props = {
  src: string;
  poster: string;
  headline: string;
  tagline: string;
  ctaLabel: string;
  onCta?: () => void;
  children?: React.ReactNode; // used to inject the one-liner rotator
};

export default function HeroVideo({
  src,
  poster,
  headline,
  tagline,
  ctaLabel,
  onCta,
  children,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const [ready, setReady] = useState(false);
  const [muted, setMuted] = useState(true);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Load video automatically after a short delay to improve initial page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldLoadVideo(true);
    }, 1000); // Load video after 1 second

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !shouldLoadVideo) {
      return;
    }
    const onMeta = () => setReady(true);
    const onData = () => setReady(true);
    const onError = () => {
      console.log('Video failed to load, keeping poster image visible');
      setVideoError(true);
      setReady(false); // Keep poster visible
    };
    
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("loadeddata", onData);
    v.addEventListener("error", onError);
    
    return () => {
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("loadeddata", onData);
      v.removeEventListener("error", onError);
    };
  }, [shouldLoadVideo]);

  return (
    <section 
      ref={sectionRef}
      className="relative isolate min-h-[80vh] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black" 
      {...(!ready && { "aria-busy": "true" })}
    >
      <div className="sr-only" aria-live="polite">
        {ready ? "Hero ready" : "Loading hero…"}
      </div>
      
      {/* Poster shows immediately; fades out once video is ready (or stays visible if video fails) */}
      <img
        src={poster}
        alt="Halloween party scene with pumpkins, trees, and a cozy house"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
          ready && !prefersReducedMotion && !videoError ? "opacity-0" : "opacity-100"
        }`}
        decoding="async"
        fetchpriority="high"
        onError={(e) => {
          console.log('Poster image failed to load:', e);
          // Fallback to a dark background if poster fails
          e.currentTarget.style.display = 'none';
        }}
      />

      {!prefersReducedMotion && shouldLoadVideo && (
        <video
          ref={videoRef}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            ready ? "opacity-100" : "opacity-0"
          }`}
          src={src}
          poster={poster}
          preload="metadata"
          muted={muted}
          playsInline
          autoPlay
          loop
          aria-label={headline}
        >
          <track
            kind="captions"
            src="/captions/hero-captions.vtt"
            srcLang="en"
            label="English captions"
            default
          />
        </video>
      )}


      {/* Text overlay */}
      <div className="relative z-20 mx-auto flex max-w-5xl flex-col items-center px-4 py-20 text-center text-ink">
        <h1 className="font-[Cinzel] text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-tight text-white drop-shadow-lg hero-title-shadow">
          {headline}
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-white opacity-95 hero-text-shadow">{tagline}</p>

        {/* Rotator injected by parent */}
        <div className="mt-3 w-full max-w-[60ch] text-white hero-text-shadow">{children}</div>

        <button
          onClick={onCta}
          className="mt-6 rsvp-button-hero"
          aria-label="Go to RSVP page"
        >
          {ctaLabel}
        </button>

        {/* Small mute/unmute control - only show if video loaded successfully */}
        {!prefersReducedMotion && shouldLoadVideo && ready && !videoError && (
          <button
            onClick={() => setMuted((m) => !m)}
            className="absolute right-4 top-4 rounded-md bg-black/40 px-3 py-1 text-xs backdrop-blur transition hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label={muted ? "Unmute hero video" : "Mute hero video"}
            title={muted ? "Unmute" : "Mute"}
          >
            {muted ? "🔈" : "🔊"}
          </button>
        )}
      </div>

      {/* Legibility gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
    </section>
  );
}