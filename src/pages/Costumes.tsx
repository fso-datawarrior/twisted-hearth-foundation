import { useState } from "react";
import Footer from "@/components/Footer";
import Carousel from "@/components/Carousel";
import HuntHintTrigger from "@/components/hunt/HuntHintTrigger";

const Costumes = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  
  const filterCategories = ["All", "Royalty", "Creatures", "Cursed", "Woodland"];
  
  const costumeInspiration = [
    {
      id: 1,
      title: "Ragged Queen of Thorns",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop",
      description: "Crown of twisted vines, torn royal robes, ruling from ruins.",
      category: "Royalty"
    },
    {
      id: 2, 
      title: "Wolf-Worn Hunter",
      image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=600&fit=crop",
      description: "Red cloak stained with secrets, eyes that have seen too much.",
      category: "Cursed"
    },
    {
      id: 3,
      title: "Moss-Eaten Dryad", 
      image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=600&fit=crop",
      description: "Ancient tree spirit, bark for skin, leaves for hair.",
      category: "Woodland"
    },
    {
      id: 4,
      title: "Poisoned Princess",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=600&fit=crop",
      description: "Beauty preserved by toxins, apple-red lips that kill with a kiss.",
      category: "Royalty"
    },
    {
      id: 5,
      title: "Spectral Swan",
      image: "https://images.unsplash.com/photo-1516726817505-f5ed825624d8?w=400&h=600&fit=crop", 
      description: "Cursed to dance forever, feathers falling like snow.",
      category: "Cursed"
    },
    {
      id: 6,
      title: "Bear King's Heir",
      image: "https://images.unsplash.com/photo-1485062934645-5c8021e4b5b5?w=400&h=600&fit=crop",
      description: "Royal beast with crown of bone, civilized but wild.",
      category: "Creatures"
    },
    {
      id: 7,
      title: "Thorn Witch of the Briar",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop",
      description: "Guardian of sleeping curses, spinner of endless dreams.",
      category: "Woodland"
    },
    {
      id: 8,
      title: "Shadow Court Jester",
      image: "https://images.unsplash.com/photo-1454391304352-2bf4678b1a7a?w=400&h=600&fit=crop",
      description: "Entertainer of the damned, jokes that cut like knives.",
      category: "Royalty"
    },
    {
      id: 9,
      title: "Raven Parliament Speaker",
      image: "https://images.unsplash.com/photo-1455218873509-8097305ee378?w=400&h=600&fit=crop",
      description: "Collector of secrets, keeper of dark prophecies.",
      category: "Creatures"
    },
    {
      id: 10,
      title: "Mushroom Circle Keeper",
      image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=600&fit=crop",
      description: "Guardian of fairy rings, dealer in dangerous bargains.",
      category: "Woodland"
    },
    {
      id: 11,
      title: "Mirror Shard Collector",
      image: "https://images.unsplash.com/photo-1548142813-c348350df52b?w=400&h=600&fit=crop",
      description: "Seven reflections, each showing a different truth.",
      category: "Cursed"
    },
    {
      id: 12,
      title: "Bone Crown Emperor",
      image: "https://images.unsplash.com/photo-1509557965043-e78fcf5299ad?w=400&h=600&fit=crop",
      description: "Ruler of forgotten kingdoms, crowned with the past.",
      category: "Royalty"
    }
  ];

  const filteredCostumes = activeFilter === "All" 
    ? costumeInspiration 
    : costumeInspiration.filter(costume => costume.category === activeFilter);

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
            
            {/* Filter Chips */}
            <div className="mb-8">
              <div className="flex flex-wrap justify-center gap-3" id="costumes.filter">
                <HuntHintTrigger 
                  id="costumes.filter" 
                  label="Choose your mask wisely"
                  bonus={true}
                  className="absolute -top-2 -right-2"
                />
                {filterCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveFilter(category)}
                    className={`px-4 py-2 rounded-full font-subhead text-sm transition-colors motion-safe focus-visible ${
                      activeFilter === category
                        ? "bg-accent-gold text-background"
                        : "bg-bg-2 text-ink hover:bg-accent-purple/20 border border-accent-purple/30"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Costume Carousel */}
            <div className="mb-16">
              <h2 className="font-subhead text-3xl text-center mb-8 text-accent-gold">
                Featured Twisted Interpretations
              </h2>
              <Carousel 
                items={filteredCostumes}
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