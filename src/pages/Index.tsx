import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "@/components/NavBar";
import HeroVideo from "@/components/HeroVideo";
import Footer from "@/components/Footer";
import Card from "@/components/Card";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";

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
    if (prefersReducedMotion) return;
    const id = setInterval(() => {
      if (paused.current) return;
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
      title: "Interactive Storytelling",
      hook: "You're not just watching the story unfold - you're living it. Every choice shapes the narrative.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop"
    },
    {
      id: 2,
      title: "Twisted Fairytale Costumes",
      hook: "From corporate Cinderella to surveillance Red Riding Hood - reimagine classic characters for the modern world.",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop"
    },
    {
      id: 3,
      title: "Feast of Dark Delights",
      hook: "Potluck with a twist. Bring a dish inspired by your favorite (or most feared) fairytale.",
      image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      {/* Hero Section */}
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
      
      {/* Main Content */}
      <main id="main-content" className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          
          {/* Past Vignettes Section */}
          <section className="mb-16">
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
                  className="hover:shadow-lg hover:shadow-accent-green/20 hover:rotate-1 motion-safe transition-all cursor-pointer"
                />
              ))}
            </div>
            
            <div className="text-center">
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-accent-purple to-transparent mx-auto mb-4" />
              <a 
                href="/about" 
                className="font-subhead text-accent-gold hover:text-ink transition-colors inline-flex items-center gap-2"
              >
                See more about the theme <span aria-hidden="true">→</span>
              </a>
            </div>
          </section>

          {/* Event Overview */}
          <section className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl mb-6 text-accent-gold">
              October 31st, 2024
            </h2>
            <p className="font-body text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Join Jamie & Kat Ruth for an immersive Halloween experience where beloved fairytales 
              meet contemporary darkness. This isn't your childhood storybook - this is what happens 
              when reality bites back.
            </p>
            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="font-heading text-3xl mb-2 text-accent-purple">🕰️</div>
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
                  image={highlight.image}
                  title={highlight.title}
                  hook={highlight.hook}
                  className="hover-tilt motion-safe"
                />
              ))}
            </div>
          </section>
          
          {/* Quick Links */}
          <section className="mb-16">
            <div className="bg-card p-8 rounded-lg border border-accent-purple/30">
              <h2 className="font-subhead text-3xl text-center mb-8 text-accent-gold">
                Prepare for Your Twisted Tale
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button 
                  asChild 
                  variant="outline" 
                  className="border-accent-purple text-accent-purple hover:bg-accent-purple/20 hover:text-accent-gold font-subhead"
                >
                  <a href="/costumes">Costume Ideas</a>
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  className="border-accent-green text-accent-green hover:bg-accent-green/20 hover:text-accent-gold font-subhead"
                >
                  <a href="/schedule">Event Schedule</a>
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  className="border-accent-gold text-accent-gold hover:bg-accent-gold/20 hover:text-ink font-subhead"
                >
                  <a href="/feast">Feast Details</a>
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  className="border-accent-red text-accent-red hover:bg-accent-red/20 hover:text-accent-gold font-subhead"
                >
                  <a href="/vignettes">Past Stories</a>
                </Button>
              </div>
            </div>
          </section>
          
          {/* Call to Action */}
          <section className="text-center">
            <div className="bg-bg-2 p-12 rounded-lg border border-accent-red/50 max-w-3xl mx-auto">
              <h2 className="font-heading text-4xl mb-6 text-accent-red">
                Your Story Awaits
              </h2>
              <p className="font-body text-lg text-muted-foreground mb-8">
                Every fairytale needs its characters. Will you be the hero, the villain, 
                or something entirely unexpected? The choice is yours, but choose wisely - 
                not all who enter leave unchanged.
              </p>
              <Button 
                asChild 
                size="lg"
                className="bg-accent-red hover:bg-accent-red/80 text-ink font-subhead text-xl px-16 py-6 glow-gold hover:scale-105 transition-all motion-safe"
              >
                <a href="/rsvp">Join the Tale</a>
              </Button>
              
              <p className="font-body text-sm text-muted-foreground mt-6 italic">
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
      
      <Footer />
    </div>
  );
};

export default Index;