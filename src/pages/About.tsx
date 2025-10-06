import Footer from "@/components/Footer";
import HuntRune from "@/components/hunt/HuntRune";
// import CSSFogBackground from "@/components/CSSFogBackground";

const About = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <main className="pt-20 relative z-10">
        {/* CSS animated fog effect */}
        {/* <CSSFogBackground /> */}
        <section className="py-16 px-6">
          <div className="container mx-auto max-w-4xl">
            <h1 className="font-heading text-4xl md:text-6xl text-center mb-8 text-shadow-gothic">
              About the Twisted Fairytale
            </h1>
            
            <div className="prose prose-invert max-w-none">
              <p className="font-body text-lg text-center mb-12 text-muted-foreground">
                Down the rabbit hole we go, where Alice's madness has infected every fairytale...
              </p>
              
              <div className="grid md:grid-cols-2 gap-12">
                <div className="bg-card p-8 rounded-lg border border-accent-purple/30">
                  <h2 className="font-subhead text-2xl mb-4 text-accent-gold">The Theme</h2>
                  <p className="font-body text-muted-foreground mb-4">
                    Alice fell down the rabbit hole and never came back the same. Her madness has 
                    spread like wildfire through Wonderland, corrupting every fairytale it touches. 
                    Now Snow White's apple carries the Queen of Hearts' curse, Goldilocks finds 
                    herself trapped in the Mad Hatter's tea party, and the Big Bad Wolf has become 
                    the Cheshire Cat's latest victim.
                  </p>
                  <p className="font-body text-muted-foreground">
                    Come dressed as your favorite fairytale character, but beware - Alice's influence 
                    has twisted them all. Will you embrace the madness or fight to restore order?
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
                    This year's Alice-influenced fairytale theme promises to be their most ambitious yet, 
                    complete with interactive storytelling, themed rooms, and surprises around 
                    every corner. Will you find your way out of Wonderland, or will you be lost 
                    in the madness forever?
                  </p>
                </div>
              </div>
              
              <div className="mt-12 text-center">
                <h2 className="font-subhead text-3xl mb-6 text-accent-gold">What to Expect</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-bg-2 p-6 rounded-lg">
                    <h3 className="font-subhead text-xl mb-3 text-accent-green">Twisted Treats</h3>
                    <p className="font-body text-sm text-muted-foreground">
                      Fairytale-inspired cocktails and appetizers with a dark culinary twist
                    </p>
                  </div>
                  <div className="bg-bg-2 p-6 rounded-lg">
                    <h3 className="font-subhead text-xl mb-3 text-accent-red">Cursed Pong Tournament</h3>
                    <p className="font-body text-sm text-muted-foreground">
                      The annual battle where every miss is a step closer to the underworld. 
                      Will you survive the cursed cups?
                    </p>
                  </div>
                  <div className="bg-bg-2 p-6 rounded-lg">
                    <h3 className="font-subhead text-xl mb-3 text-accent-gold">Costume Contest</h3>
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
      
      <div className="relative z-10">
        <HuntRune 
          id="14" 
          label="Ink that won't dry"
          className="absolute top-4 left-8"
        />
        <Footer />
      </div>
    </div>
  );
};

export default About;