import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import Carousel from "@/components/Carousel";
import HuntHintTrigger from "@/components/hunt/HuntHintTrigger";

const Costumes = () => {
  const costumeInspiration = [
    {
      id: 1,
      title: "Corporate Cinderella",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop",
      description: "Glass ceiling instead of glass slipper. Power suit with subtle fairy godmother tech accessories."
    },
    {
      id: 2, 
      title: "Surveillance Red Riding Hood",
      image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=600&fit=crop",
      description: "Red hooded cloak embedded with cameras and tracking devices. The hunter becomes the hunted."
    },
    {
      id: 3,
      title: "Influencer Rapunzel", 
      image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=600&fit=crop",
      description: "LED fiber optic hair extensions, ring light crown, and 'trapped' by social media metrics."
    },
    {
      id: 4,
      title: "Pharmaceutical Snow White",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=600&fit=crop",
      description: "Lab coat princess with poison apple prescription bottles and seven dwarf test subjects."
    },
    {
      id: 5,
      title: "Climate Change Elsa",
      image: "https://images.unsplash.com/photo-1516726817505-f5ed825624d8?w=400&h=600&fit=crop", 
      description: "Melting ice dress with rising sea level hemline. 'Let it go' takes on new meaning."
    },
    {
      id: 6,
      title: "Gentrified Three Bears",
      image: "https://images.unsplash.com/photo-1485062934645-5c8021e4b5b5?w=400&h=600&fit=crop",
      description: "Upscale bear family displaced by development. Goldilocks as a real estate developer."
    }
  ];

  const costumeCategories = [
    {
      title: "Classic with a Twist",
      description: "Take a beloved character and add a modern, dark, or unexpected element",
      examples: ["Therapist Fairy Godmother", "Divorced Prince Charming", "Unionized Seven Dwarfs"]
    },
    {
      title: "Modern Reimagining", 
      description: "Place fairytale characters in contemporary settings with relevant themes",
      examples: ["Tech Startup Wizard", "Social Media Witch", "Gig Economy Genie"]
    },
    {
      title: "Role Reversal",
      description: "Flip the traditional roles - make villains heroic or heroes villainous", 
      examples: ["Misunderstood Dragon", "Corporate Stepmother", "Activist Big Bad Wolf"]
    },
    {
      title: "Original Creation",
      description: "Invent your own twisted fairytale character with a compelling backstory",
      examples: ["The 13th Fairy Godmother", "Midnight's Accountant", "The Sequel Princess"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="pt-20">
        <section className="py-16 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="relative">
              <HuntHintTrigger 
                id="costumes.header" 
                label="Masks within masks"
                className="absolute top-0 right-4"
              />
              <h1 className="font-heading text-4xl md:text-6xl text-center mb-8 text-shadow-gothic">
                Costume Inspiration Gallery
              </h1>
            </div>
            
            <p className="font-body text-lg text-center mb-12 text-muted-foreground max-w-3xl mx-auto">
              Transform your favorite fairytale character with a twisted modern interpretation. 
              The more creative and thought-provoking, the better!
            </p>
            
            {/* Costume Carousel */}
            <div className="mb-16">
              <h2 className="font-subhead text-3xl text-center mb-8 text-accent-gold">
                Featured Twisted Interpretations
              </h2>
              <Carousel 
                items={costumeInspiration}
                visible={3}
                auto={true}
                interval={5000}
                className="mb-8"
              />
            </div>
            
            {/* Costume Categories */}
            <div className="mb-16">
              <h2 className="font-subhead text-3xl text-center mb-8 text-accent-gold">
                Costume Categories & Ideas
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                {costumeCategories.map((category, index) => (
                  <div 
                    key={index}
                    className="bg-card p-8 rounded-lg border border-accent-purple/30 hover:border-accent-gold/50 transition-colors motion-safe"
                  >
                    <h3 className="font-subhead text-xl mb-4 text-accent-purple">
                      {category.title}
                    </h3>
                    <p className="font-body text-muted-foreground mb-4">
                      {category.description}
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-subhead text-sm uppercase text-accent-gold">Examples:</h4>
                      <ul className="font-body text-sm text-muted-foreground">
                        {category.examples.map((example, exIndex) => (
                          <li key={exIndex} className="flex items-center">
                            <span className="w-2 h-2 bg-accent-red rounded-full mr-3 flex-shrink-0"></span>
                            {example}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Contest Info */}
            <div className="relative bg-bg-2 p-8 rounded-lg border border-accent-red/50">
              <HuntHintTrigger
                id="costumes.cta"
                label="Seams stitched with secrets"
                className="absolute bottom-4 right-4"
              />
              <h2 className="font-subhead text-3xl text-center mb-6 text-accent-red">
                Costume Contest Prizes
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="font-heading text-4xl mb-2 text-accent-gold">🏆</div>
                  <h3 className="font-subhead text-lg mb-2 text-accent-gold">Most Creative Twist</h3>
                  <p className="font-body text-sm text-muted-foreground">
                    For the most innovative interpretation of a classic character
                  </p>
                </div>
                <div className="text-center">
                  <div className="font-heading text-4xl mb-2 text-accent-gold">🎭</div>
                  <h3 className="font-subhead text-lg mb-2 text-accent-gold">Best Original Character</h3>
                  <p className="font-body text-sm text-muted-foreground">
                    For creating an entirely new twisted fairytale persona
                  </p>
                </div>
                <div className="text-center">
                  <div className="font-heading text-4xl mb-2 text-accent-gold">⚡</div>
                  <h3 className="font-subhead text-lg mb-2 text-accent-gold">Most Topical</h3>
                  <p className="font-body text-sm text-muted-foreground">
                    For best incorporation of current events or social commentary
                  </p>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <p className="font-body text-muted-foreground mb-4">
                  Judging will take place during the Costume Parade at 9:30 PM. 
                  Be prepared to present your character and explain your twisted interpretation!
                </p>
                <div className="font-subhead text-accent-red">
                  "The best costumes tell a story... preferably one with a dark ending."
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Costumes;