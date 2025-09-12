import Footer from "@/components/Footer";
// import CSSFogBackground from "@/components/CSSFogBackground";
import Card from "@/components/Card";
import HuntRune from "@/components/hunt/HuntRune";

const Vignettes = () => {
  const pastVignettes = [
    {
      id: 1,
      title: "Goldilocks: Home Invasion",
      image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop",
      hook: "What really happened when Goldilocks broke into the Bears' house? A tale of obsession, surveillance, and the price of curiosity.",
      year: "2023",
      theme: "Breaking & Entering"
    },
    {
      id: 2,
      title: "Jack & The Corporate Ladder", 
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
      hook: "Jack's beanstalk led not to a giant's castle, but to the top of a corporate empire built on the bones of the working class.",
      year: "2022",
      theme: "Economic Horror"
    },
    {
      id: 3,
      title: "Snow White: Mirror, Mirror",
      image: "https://images.unsplash.com/photo-1520637836862-4d197d17c55a?w=800&h=600&fit=crop", 
      hook: "The magic mirror showed more than vanity - it revealed the darkest truths about beauty standards and self-worth in a social media age.",
      year: "2021",
      theme: "Digital Dystopia"
    }
  ];

  return (
    <div className="min-h-screen bg-background relative">
      <main className="pt-20 relative z-10">
        {/* CSS animated fog effect */}
        {/* <CSSFogBackground /> */}
        <section className="py-16 px-6">
          <div className="container mx-auto max-w-6xl">
            <h1 className="font-heading text-4xl md:text-6xl text-center mb-8 text-shadow-gothic">
              Past Twisted Vignettes
            </h1>
            
            <p className="font-body text-lg text-center mb-12 text-muted-foreground max-w-3xl mx-auto">
              Each year, we've explored different twisted takes on beloved fairytales. 
              Browse our previous performances and see how far down the rabbit hole we've gone.
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pastVignettes.map((vignette) => (
                <div key={vignette.id} className="relative">
                  <HuntRune
                    id={vignette.id === 1 ? "5" : vignette.id === 2 ? "6" : "7"}
                    label={
                      vignette.id === 1 ? "Knives gleam where spoons should lie" :
                      vignette.id === 2 ? "Coins seldom tell a clean story" :
                      "Glass remembers every breath"
                    }
                    className="absolute top-2 right-2 z-10"
                  />
                  <Card
                    variant="vignette"
                    image={vignette.image}
                    title={vignette.title}
                    hook={vignette.hook}
                    onClick={() => {
                      console.log(`Opening vignette: ${vignette.title}`);
                    }}
                    className="hover-tilt motion-safe"
                  >
                    <div className="mt-4 flex justify-between items-center text-sm">
                      <span className="font-subhead text-accent-gold">{vignette.year}</span>
                      <span className="font-body text-muted-foreground">{vignette.theme}</span>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
            
            <div className="mt-16 text-center relative">
              <div className="bg-card p-8 rounded-lg border border-accent-purple/30 max-w-2xl mx-auto">
                <h2 className="font-subhead text-2xl mb-4 text-accent-gold">This Year's Vignette</h2>
                <p className="font-body text-muted-foreground mb-6">
                  We're crafting something special for 2025. Multiple twisted tales will unfold 
                  throughout the evening, with guests becoming part of the story. Which path 
                  will you choose when the clock strikes midnight?
                </p>
                <div className="text-accent-red font-subhead text-lg">
                  "Not all who wander are lost... but some should be."
                </div>
              </div>
              <HuntRune 
                id="8" 
                label="Stories have roots"
                className="absolute bottom-4 right-4"
              />
            </div>
          </div>
        </section>
      </main>
      
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default Vignettes;