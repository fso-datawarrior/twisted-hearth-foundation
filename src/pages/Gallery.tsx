import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

const Gallery = () => {
  const placeholderImages = [
    "https://images.unsplash.com/photo-1509557965043-e78fcf5299ad?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1454391304352-2bf4678b1a7a?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1455218873509-8097305ee378?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1548142813-c348350df52b?w=400&h=400&fit=crop"
  ];

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="pt-20">
        <section className="py-16 px-6">
          <div className="container mx-auto max-w-6xl">
            <h1 className="font-heading text-4xl md:text-6xl text-center mb-8 text-shadow-gothic">
              Gallery of Twisted Tales
            </h1>
            
            <p className="font-body text-lg text-center mb-12 text-muted-foreground max-w-3xl mx-auto">
              Memories from past celebrations and previews of what's to come. 
              Every image tells a story... some darker than others.
            </p>
            
            {/* Coming Soon Message */}
            <div className="text-center mb-16">
              <div className="bg-card p-12 rounded-lg border border-accent-purple/30 max-w-3xl mx-auto">
                <div className="font-heading text-6xl mb-6 text-accent-gold">🖼️</div>
                <h2 className="font-subhead text-3xl mb-6 text-accent-red">
                  Gallery Opening Soon
                </h2>
                <p className="font-body text-muted-foreground mb-8 text-lg">
                  Our photographers are still developing the film from last year's celebration. 
                  Some images are too dark to process... others refuse to develop at all.
                </p>
                <p className="font-body text-muted-foreground mb-6">
                  This gallery will feature:
                </p>
                <div className="grid md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
                  <div className="bg-bg-2 p-4 rounded-lg">
                    <h3 className="font-subhead text-lg mb-2 text-accent-gold">Past Events</h3>
                    <ul className="font-body text-sm text-muted-foreground space-y-1">
                      <li>• Costume contest winners</li>
                      <li>• Interactive vignette moments</li>
                      <li>• Behind-the-scenes preparations</li>
                    </ul>
                  </div>
                  <div className="bg-bg-2 p-4 rounded-lg">
                    <h3 className="font-subhead text-lg mb-2 text-accent-gold">This Year</h3>
                    <ul className="font-body text-sm text-muted-foreground space-y-1">
                      <li>• Live event photography</li>
                      <li>• Guest submissions welcome</li>
                      <li>• Professional portrait station</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Placeholder Gallery Grid */}
            <div className="mb-16">
              <h2 className="font-subhead text-2xl text-center mb-8 text-accent-gold">
                Preview: Atmospheric Inspiration
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {placeholderImages.map((image, index) => (
                  <div 
                    key={index}
                    className="aspect-square bg-bg-2 rounded-lg overflow-hidden border border-accent-purple/30 hover:border-accent-gold/50 transition-colors motion-safe hover-tilt"
                  >
                    <img 
                      src={image}
                      alt={`Gallery preview ${index + 1}`}
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all motion-safe"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Photo Guidelines */}
            <div className="bg-bg-2 p-8 rounded-lg border border-accent-purple/30">
              <h2 className="font-subhead text-2xl text-center mb-6 text-accent-gold">
                Photography Guidelines
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-subhead text-lg mb-4 text-accent-purple">During the Event</h3>
                  <ul className="font-body text-sm text-muted-foreground space-y-2">
                    <li>• Photography encouraged during designated times</li>
                    <li>• Respect others' privacy and consent</li>
                    <li>• No flash during performances</li>
                    <li>• Tag us on social media: #TwistedFairytalesBash</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-subhead text-lg mb-4 text-accent-purple">Share Your Photos</h3>
                  <ul className="font-body text-sm text-muted-foreground space-y-2">
                    <li>• Email your best shots for the gallery</li>
                    <li>• Professional portrait station available</li>
                    <li>• Group photos encouraged</li>
                    <li>• Behind-the-scenes moments welcome</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <p className="font-body text-muted-foreground italic">
                  "Some memories are too dark to develop, but the best ones glow in the shadows."
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Gallery;