import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { formatEventLong, formatEventTime } from "@/lib/event";
import { useReveal } from "@/hooks/use-reveal";
import HeroVideo from "@/components/HeroVideo";
import Footer from "@/components/Footer";
import Card from "@/components/Card";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import HuntHintTrigger from "@/components/hunt/HuntHintTrigger";
// import CSSFogBackground from "@/components/CSSFogBackground";

const LINES = [
  "A cottage too cozy to trust… where the meal is already waiting.",
  "A beanstalk that leads to riches — and a very heavy downfall.",
  "A glass coffin where mourning turns into midnight hunger.",
  "Not every bedtime story ends with a kiss goodnight.",
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
  const { ref: vigRef, shown: vigShown } = useReveal();
  const { ref: prepRef, shown: prepShown } = useReveal();
  const { ref: ctaRef, shown: ctaShown } = useReveal();

  const pastVignettes = [
    {
      id: 1,
      title: "Goldilocks — The Butcher's Den",
      hook: "What if the cozy little cottage wasn't a home at all… but a butcher's den?",
      thumbImage: "/img/goldilocks-thumb.jpg",
      teaserImage: "/img/goldilocks-teaser.jpg"
    },
    {
      id: 2,
      title: "Jack & the Beanstalk — A Thief's Reward",
      hook: "What if Jack wasn't a hero at all, but a thief who finally got what he deserved?",
      thumbImage: "/img/jack-thumb.jpg",
      teaserImage: "/img/jack-teaser.jpg"
    },
    {
      id: 3,
      title: "Snow White & the Goblin-Dwarves — The Glass Coffin Feast",
      hook: "What if the seven dwarves had a curse of their own?",
      thumbImage: "/img/snowwhite-thumb.jpg",
      teaserImage: "/img/snowwhite-teaser.jpg"
    }
  ];

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
      {/* Hunt triggers positioned absolutely */}
      <div className="relative">
        <HuntHintTrigger 
          id="home.logo" 
          label="Hidden mark near the crest" 
          className="absolute top-4 left-4 z-50" 
        />
        <HuntHintTrigger 
          id="home.moon" 
          label="Something stirs beneath the moon"
          className="absolute top-6 right-6 z-50"
        />
      </div>
      
      {/* Hero Section */}
      <div className="relative">
        <HuntHintTrigger 
          id="home.path" 
          label="Footsteps that don't belong"
          className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-50"
        />
        <HuntHintTrigger 
          id="home.cta" 
          label="A whisper urging you forward"
          className="absolute bottom-6 right-8 z-50"
        />
        
        <HeroVideo
          src="/hero.mp4"
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
        {/* GLSL animated smoke effect for main content areas only */}
        {/* <CSSFogBackground /> */}
        <div className="container mx-auto max-w-6xl relative z-10">
          
          {/* Past Vignettes Section */}
          <section ref={vigRef as any} className={`mb-16 reveal ${vigShown ? "reveal--shown" : ""}`}>
            <h2 className="font-heading text-4xl md:text-5xl text-center mb-4 text-accent-gold">
              Twisted Tales of Years Past
            </h2>
            <p className="font-body text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Glimpse the darkness that has unfolded in previous gatherings. Each tale a warning, 
              each story a promise of what's to come.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              {pastVignettes.map((vignette) => (
                <Card
                  key={vignette.id}
                  variant="vignette"
                  image={vignette.thumbImage}
                  title={vignette.title}
                  hook={vignette.hook}
                  onClick={() => setSelectedVignette(vignette)}
                  className="hover:shadow-lg hover:shadow-accent-green/20 motion-safe:hover:-translate-y-0.5 motion-safe:hover:scale-[1.01] transition-all motion-reduce:transition-none cursor-pointer"
                />
              ))}
            </div>
            
            <div className="text-center">
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-accent-purple to-transparent mx-auto mb-4" />
              <Link 
                to="/about" 
                className="font-subhead text-accent-gold hover:text-ink transition-colors inline-flex items-center gap-2"
              >
                See more about the theme <span aria-hidden="true">→</span>
              </Link>
            </div>
          </section>

          {/* Event Overview */}
          <section className="text-center mb-16">
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
                <h3 className="font-subhead text-lg mb-1 text-accent-gold">7:00 PM Start</h3>
                <p className="font-body text-sm text-muted-foreground">Gates open at twilight</p>
              </div>
              <div className="text-center">
                <div className="font-heading text-3xl mb-2 text-accent-red">🎭</div>
                <h3 className="font-subhead text-lg mb-1 text-accent-gold">Interactive Experience</h3>
                <p className="font-body text-sm text-muted-foreground">You shape the story</p>
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
          
          {/* Quick Links */}
          <section ref={prepRef as any} className={`mb-16 reveal ${prepShown ? "reveal--shown" : ""}`}>
            <div className="bg-card p-6 sm:p-8 rounded-lg border border-accent-purple/30">
              <h2 className="font-subhead text-2xl sm:text-3xl text-center mb-6 sm:mb-8 text-accent-gold tracking-tight text-balance">
                Prepare for Your Twisted Tale
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button 
                  asChild 
                  variant="outline" 
                  className="h-9 sm:h-10 md:h-11 text-sm sm:text-base px-3 sm:px-4 border-accent-purple text-accent-gold hover:bg-accent-purple/20 hover:text-accent-gold font-subhead"
                >
                  <Link to="/costumes">Costume Ideas</Link>
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  className="h-9 sm:h-10 md:h-11 text-sm sm:text-base px-3 sm:px-4 border-accent-green text-accent-green hover:bg-accent-green/20 hover:text-accent-gold font-subhead"
                >
                  <Link to="/schedule">Event Schedule</Link>
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  className="h-9 sm:h-10 md:h-11 text-sm sm:text-base px-3 sm:px-4 border-accent-gold text-accent-gold hover:bg-accent-gold/20 hover:text-ink font-subhead"
                >
                  <Link to="/feast">Feast Details</Link>
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  className="h-9 sm:h-10 md:h-11 text-sm sm:text-base px-3 sm:px-4 border-accent-red text-accent-red hover:bg-accent-red/20 hover:text-accent-gold font-subhead"
                >
                  <Link to="/vignettes">Past Stories</Link>
                </Button>
              </div>
            </div>
          </section>
          
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
                size="lg"
                className="bg-[--accent-red] hover:bg-[--accent-red]/80 text-ink font-subhead text-base sm:text-lg md:text-xl px-8 sm:px-12 md:px-16 py-4 sm:py-5 md:py-6 glow-red-pulse motion-safe:hover:scale-105 motion-safe:active:scale-[0.99] transition-all motion-reduce:transition-none"
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
              src={selectedVignette.teaserImage}
              alt={selectedVignette.title}
              className="w-full h-64 object-cover rounded-lg mb-6"
              width="600"
              height="256"
              decoding="async"
            />
            <h3 
              className="font-heading text-2xl md:text-3xl mb-4 text-accent-gold"
              id={`vignette-title-${selectedVignette.id}`}
            >
              {selectedVignette.title}
            </h3>
            <p className="font-body text-lg text-muted-foreground leading-relaxed">
              {selectedVignette.hook}
            </p>
          </div>
        )}
      </Modal>
      
      {/* Footer with hunt trigger */}
      <div className="relative">
        <HuntHintTrigger 
          id="home.footer.icon" 
          label="A faint crown in the dark"
          className="absolute top-2 left-8 z-50"
        />
        <Footer />
      </div>
    </div>
  );
};

export default Index;