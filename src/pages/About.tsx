
import Footer from "@/components/Footer";
import HuntHintTrigger from "@/components/hunt/HuntHintTrigger";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <main className="pt-20">
        <section className="py-16 px-6">
          <div className="container mx-auto max-w-4xl">
            <h1 className="font-heading text-4xl md:text-6xl text-center mb-8 text-shadow-gothic">
              About the Twisted Fairytale
            </h1>
            
            <div className="prose prose-invert max-w-none">
              <p className="font-body text-lg text-center mb-12 text-muted-foreground">
                Step into a world where happily ever after takes a darker turn...
              </p>
              
              <div className="grid md:grid-cols-2 gap-12">
                <div className="bg-card p-8 rounded-lg border border-accent-purple/30">
                  <h2 className="font-subhead text-2xl mb-4 text-accent-gold">The Theme</h2>
                  <p className="font-body text-muted-foreground mb-4">
                    What happens when classic fairytales take a sinister twist? Join us for an evening 
                    where Snow White's apple is truly poisoned, where Goldilocks faces consequences 
                    for her breaking and entering, and where the Big Bad Wolf isn't the only predator 
                    in the woods.
                  </p>
                  <p className="font-body text-muted-foreground">
                    Come dressed as your favorite fairytale character with a dark twist, or create 
                    an entirely new twisted tale of your own.
                  </p>
                </div>
                
                <div className="bg-card p-8 rounded-lg border border-accent-purple/30">
                  <h2 className="font-subhead text-2xl mb-4 text-accent-gold">Your Hosts</h2>
                  <p className="font-body text-muted-foreground mb-4">
                    Jamie & Kat Ruth have been hosting legendary Halloween celebrations for years, 
                    each more elaborate than the last. Known for their attention to detail and 
                    commitment to immersive experiences, they've transformed their home into 
                    various haunted realms.
                  </p>
                  <p className="font-body text-muted-foreground">
                    This year's twisted fairytale theme promises to be their most ambitious yet, 
                    complete with interactive storytelling, themed rooms, and surprises around 
                    every corner.
                  </p>
                </div>
              </div>
              
              <div className="mt-12 text-center">
                <h2 className="font-subhead text-3xl mb-6 text-accent-gold">What to Expect</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-bg-2 p-6 rounded-lg">
                    <h3 className="font-subhead text-xl mb-3 text-accent-purple">Immersive Storytelling</h3>
                    <p className="font-body text-sm text-muted-foreground">
                      Live performances and interactive story elements throughout the night
                    </p>
                  </div>
                  <div className="bg-bg-2 p-6 rounded-lg">
                    <h3 className="font-subhead text-xl mb-3 text-accent-green">Twisted Treats</h3>
                    <p className="font-body text-sm text-muted-foreground">
                      Fairytale-inspired cocktails and appetizers with a dark culinary twist
                    </p>
                  </div>
                  <div className="bg-bg-2 p-6 rounded-lg">
                    <h3 className="font-subhead text-xl mb-3 text-accent-red">Costume Contest</h3>
                    <p className="font-body text-sm text-muted-foreground">
                      Prizes for most creative, most twisted, and best original fairytale character
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <div className="relative">
        <HuntHintTrigger 
          id="about.sig" 
          label="Ink that won't dry"
          className="absolute top-4 left-8"
        />
        <Footer />
      </div>
    </div>
  );
};

export default About;