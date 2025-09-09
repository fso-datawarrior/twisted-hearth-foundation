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
  const [ready, setReady] = useState(false);
  const [muted, setMuted] = useState(true);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const v = videoRef.current;
    if (!v) {
      return;
    }
    const onMeta = () => setReady(true);
    const onData = () => setReady(true);
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("loadeddata", onData);
    return () => {
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("loadeddata", onData);
    };
  }, []);

  return (
    <section className="relative isolate min-h-[80vh] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black" {...(!ready && { "aria-busy": "true" })}>
      <div className="sr-only" aria-live="polite">
        {ready ? "Hero ready" : "Loading hero…"}
      </div>
      
      {/* Poster shows immediately; fades out once video is ready */}
      <img
        src={poster}
        alt=""
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
          ready && !prefersReducedMotion ? "opacity-0" : "opacity-100"
        }`}
        decoding="async"
        fetchPriority="high"
        onError={(e) => {
          console.log('Poster image failed to load:', e);
          // Fallback to a dark background if poster fails
          e.currentTarget.style.display = 'none';
        }}
      />

      {!prefersReducedMotion && (
        <video
          ref={videoRef}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            ready ? "opacity-100" : "opacity-0"
          }`}
          src={src}
          poster={poster}
          preload="metadata"
          muted={muted}
          playsInline={true}
          autoPlay
          loop
          aria-label={headline}
          onError={(e) => {
            console.log('Video failed to load:', e);
            setReady(false);
          }}
          onLoadStart={(e) => {
            // Fallback for older browsers
            const video = e.currentTarget as HTMLVideoElement;
            if (video && typeof video.setAttribute === 'function') {
              video.setAttribute('webkit-playsinline', 'true');
            }
          }}
        >
          <track
            kind="captions"
            src="/captions/hero-captions.vtt"
            srcLang="en"
            label="English captions"
            default
            onError={(e) => {
              console.log('Captions track failed to load:', e);
              // Remove track element if it fails to load
              e.currentTarget.remove();
            }}
          />
        </video>
      )}

      {/* Text overlay */}
      <div className="relative z-20 mx-auto flex max-w-5xl flex-col items-center px-4 py-20 text-center text-ink">
        <h1 className="font-[Cinzel] text-4xl sm:text-6xl md:text-7xl leading-tight text-white drop-shadow-lg hero-title-shadow">
          {headline}
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-white opacity-95 hero-text-shadow">{tagline}</p>

        {/* Rotator injected by parent */}
        <div className="mt-3 w-full max-w-[60ch] text-white hero-text-shadow">{children}</div>

        <button
          onClick={onCta}
          className="mt-6 rounded-lg bg-[--accent-red] px-6 py-3 text-base font-semibold text-white shadow-[0_0_20px_rgba(139,0,0,0.5)] transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[--accent-gold]"
          aria-label="Go to RSVP page"
        >
          {ctaLabel}
        </button>

        {/* Small mute/unmute control */}
        {!prefersReducedMotion && (
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