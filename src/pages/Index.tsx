import NavBar from "@/components/NavBar";
import HeroVideo from "@/components/HeroVideo";
import Footer from "@/components/Footer";
import Card from "@/components/Card";
import { Button } from "@/components/ui/button";

const Index = () => {
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
        poster="https://images.unsplash.com/photo-1509557965043-e78fcf5299ad?w=1920&h=1080&fit=crop"
        headline="The Ruths' Twisted Fairytale Halloween Bash"
        tagline="Where happily ever after takes a darker turn..."
        cta={{
          label: "Secure Your Place",
          href: "/rsvp"
        }}
      />
      
      {/* Main Content */}
      <main id="main-content" className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          
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
      
      <Footer />
    </div>
  );
};

export default Index;