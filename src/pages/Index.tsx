import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import { formatEventLong, formatEventTime } from "@/lib/event";
import { useReveal } from "@/hooks/use-reveal";
import { getHomepageVignettes } from "@/lib/vignette-api";
import HeroVideo from "@/components/HeroVideo";
import Footer from "@/components/Footer";
import Card from "@/components/Card";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import PrepLinks from "@/components/PrepLinks";
// import CSSFogBackground from "@/components/CSSFogBackground";

// v3.0.3.0-development - Testing automated dev deployment
const LINES = [
  "A cottage too cozy to trust… where the meal is already waiting.",
  "A beanstalk that leads to riches — and a very heavy downfall.",
  "A glass coffin where mourning turns into midnight hunger.",
  "Not every bedtime story ends with a kiss goodnight.",
  "🧪 DEV TEST: v3.0.3.0 - Automated deployment is working!",
];

function OneLinerRotator() {
  const [i, setI] = useState(0);
  const [fade, setFade] = useState(true);
  const paused = useRef(false);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }
    const id = setInterval(() => {
      if (paused.current) {
        return;
      }
      setFade(false);
      setTimeout(() => {
        setI((n) => (n + 1) % LINES.length);
        setFade(true);
      }, 250);
    }, 4500);
    return () => clearInterval(id);
  }, [prefersReducedMotion]);

  return (
    <div
      className="mx-auto min-h-[1.8em] max-w-[60ch] text-balance text-sm sm:text-base leading-snug"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
    >
      <span
        className={`inline-block transition-opacity duration-300 ${
          fade ? "opacity-100" : "opacity-0"
        }`}
      >
        {LINES[i]}
      </span>
    </div>
  );
}

const Index = () => {
  const [selectedVignette, setSelectedVignette] = useState<any>(null);
  const navigate = useNavigate();
  
  // Section reveals
  const vigReveal = useReveal();
  const ctaReveal = useReveal();
  const { ref: vigRef, shown: vigShown } = vigReveal;
  const { ref: ctaRef, shown: ctaShown } = ctaReveal;

  // Fetch homepage vignettes from database
  const { data: pastVignettes = [], isLoading: vignettesLoading } = useQuery({
    queryKey: ['homepage-vignettes'],
    queryFn: getHomepageVignettes,
  });

  const featuredHighlights = [
    {
      id: 1,
      title: "Cursed Pong Tournament",
      hook: "The annual battle where every miss is a step closer to the underworld. Will you survive the cursed cups?",
      video: "/pongCupsTrophy.mp4"
    },
    {
      id: 2,
      title: "Twisted Fairytale Costumes",
      hook: "From corporate Cinderella to surveillance Red Riding Hood - reimagine classic characters for the modern world.",
      video: "/costumeWalk.mp4"
    },
    {
      id: 3,
      title: "Feast of Dark Delights",
      hook: "Potluck with a twist. Bring a dish inspired by your favorite (or most feared) fairytale.",
      video: "/twistedTailsFood.mp4"
    }
  ];

  return (
    <div className="min-h-screen bg-background relative">
      {/* Hunt triggers moved below hero to avoid hero overlay */}
      
      {/* Hero Section (no runes on hero) */}
      <div className="relative">
        <HeroVideo
          src="/hero-video.mp4"
          poster="/hero-poster.jpg"
          headline="The Ruths' Twisted Fairytale Halloween Bash"
          tagline="Grimm, gruesome, and just the right amount of wrong."
          ctaLabel="RSVP"
          onCta={() => navigate("/rsvp")}
        >
          <OneLinerRotator />
        </HeroVideo>
      </div>
      
      {/* Main Content */}
      <main id="main" className="py-16 px-6 relative z-10">
        {/* Positioned hunt triggers below hero and away from page edges */}
        <div className="container mx-auto max-w-6xl relative">
        </div>
        {/* GLSL animated smoke effect for main content areas only */}
        {/* <CSSFogBackground /> */}
        <div className="container mx-auto max-w-6xl relative z-10">
          
          {/* Past Vignettes Section */}
          <section ref={vigRef as any} className={`mb-16 reveal ${vigShown ? "reveal--shown" : ""} relative`}>
            <h2 className="font-heading text-4xl md:text-5xl text-center mb-4 text-accent-gold">
              Twisted Tales of Years Past
            </h2>
            <p className="font-body text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Glimpse the darkness that has unfolded in previous gatherings. Each tale a warning, 
              each story a promise of what's to come.
            </p>
            
            {vignettesLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading vignettes...</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-8 mb-8">
                {pastVignettes.map((vignette, index) => (
                  <Card
                    key={vignette.id}
                    variant="vignette"
                    image={vignette.thumbnail_url}
                    title={vignette.title}
                    hook={vignette.description}
                    onClick={() => setSelectedVignette(vignette)}
                    className={`hover:shadow-lg motion-safe:hover:-translate-y-0.5 motion-safe:hover:scale-[1.01] transition-all motion-reduce:transition-none cursor-pointer ${
                      index === 0 
                        ? "hover:shadow-accent-green/30 hover:border-accent-green/50" 
                        : "hover:shadow-accent-green/20"
                    }`}
                  />
                ))}
              </div>
            )}
            
            <div className="text-center">
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-accent-purple to-transparent mx-auto mb-4" />
              <div className="inline-flex items-center gap-2 relative">
                <Link 
                  to="/about" 
                  className="font-subhead text-accent-gold hover:text-ink transition-colors inline-flex items-center gap-2"
                >
                  See more about the theme <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </section>

          {/* Event Overview */}
          <section className="text-center mb-16 relative">
            <h2 className="font-heading text-4xl md:text-5xl mb-6 text-accent-gold uppercase tracking-wide">
              {formatEventLong()}
            </h2>
            <p className="mt-1 text-sm opacity-80 mb-6">
              {formatEventTime()} start • Location revealed after RSVP
            </p>
            <p className="font-body text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Join Jamie & Kat Ruth for an immersive Halloween experience where beloved fairytales 
              meet contemporary darkness. This isn't your childhood storybook - this is what happens 
              when reality bites back.
            </p>
            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="font-heading text-3xl mb-2 text-accent-gold">🕰️</div>
                <h3 className="font-subhead text-lg mb-1 text-accent-gold">6:30 PM Start</h3>
                <p className="font-body text-sm text-muted-foreground">Doors open at twilight</p>
              </div>
              <div className="text-center">
                <div className="font-heading text-3xl mb-2 text-accent-red">🍺</div>
                <h3 className="font-subhead text-lg mb-1 text-accent-gold">Interactive Experience — Beer Pong Tournament</h3>
                <p className="font-body text-sm text-muted-foreground">
                  <strong className="text-accent-red">The Tournament Returns — Faster Than Ever!</strong><br/>
                  Last year's epic showdown went late into the witching hour. This year, we've crafted a new fast-play format so games keep flowing and fun never stalls. Shorter rounds, tighter rules, more chances for everyone to play — the competition will be fierce, but the laughs will be louder.
                </p>
              </div>
              <div className="text-center">
                <div className="font-heading text-3xl mb-2 text-accent-green">🍷</div>
                <h3 className="font-subhead text-lg mb-1 text-accent-gold">Twisted Feast</h3>
                <p className="font-body text-sm text-muted-foreground">Potluck with dark themes</p>
              </div>
            </div>
          </section>
          
          {/* Featured Highlights */}
          <section className="mb-16">
            <h2 className="font-subhead text-3xl text-center mb-12 text-accent-gold">
              What Awaits You in the Darkness
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {featuredHighlights.map((highlight) => (
                <Card
                  key={highlight.id}
                  variant="vignette"
                  video={highlight.video}
                  videoPosition={highlight.id === 2 ? "top" : "center"}
                  title={highlight.title}
                  hook={highlight.hook}
                  className="hover-tilt motion-safe"
                />
              ))}
            </div>
          </section>
          
          {/* Quick Links / Prepare section */}
          <PrepLinks />
          
          {/* Call to Action */}
          <section ref={ctaRef as any} className={`text-center reveal ${ctaShown ? "reveal--shown" : ""}`}>
            <div className="bg-bg-2 p-6 sm:p-8 md:p-12 rounded-lg border border-accent-red/50 max-w-3xl mx-auto">
              <h2 className="font-heading text-3xl sm:text-4xl mb-4 sm:mb-6 text-accent-red tracking-tight text-balance">
                Your Story Awaits
              </h2>
              <p className="font-body text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8">
                Every fairytale needs its characters. Will you be the hero, the villain, 
                or something entirely unexpected? The choice is yours, but choose wisely - 
                not all who enter leave unchanged.
              </p>
              <Button 
                asChild 
                className="rsvp-button-cta"
              >
                <Link to="/rsvp">Join the Tale</Link>
              </Button>
              
              <p className="font-body text-sm text-muted-foreground mt-4 sm:mt-6 italic">
                "Once upon a time is now. What happens next is up to you."
              </p>
            </div>
          </section>
        </div>
      </main>
      
      {/* Vignette Modal */}
      <Modal
        isOpen={!!selectedVignette}
        onClose={() => setSelectedVignette(null)}
        ariaLabel={selectedVignette ? `Details for ${selectedVignette.title}` : "Vignette details"}
        className="max-w-3xl"
      >
        {selectedVignette && (
          <div className="text-center">
            <img 
              src={selectedVignette.teaser_url}
              alt={selectedVignette.title}
              className="w-full h-64 object-cover rounded-lg mb-6"
              width="600"
              height="256"
              decoding="async"
              loading="lazy"
            />
            <h3 
              className="font-heading text-2xl md:text-3xl mb-4 text-accent-gold"
              id={`vignette-title-${selectedVignette.id}`}
            >
              {selectedVignette.title}
            </h3>
            <p className="font-body text-lg text-muted-foreground leading-relaxed">
              {selectedVignette.description}
            </p>
          </div>
        )}
      </Modal>
      
      {/* Footer with hunt trigger */}
      <div className="relative">
        <Footer />
      </div>
    </div>
  );
};

export default Index;