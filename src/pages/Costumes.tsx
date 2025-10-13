import { useState } from "react";
import Footer from "@/components/Footer";
// import CSSFogBackground from "@/components/CSSFogBackground";
import Carousel from "@/components/Carousel";
import { useIsMobile } from "@/hooks/use-mobile";

const Costumes = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const isMobile = useIsMobile();
  
  // Responsive carousel visible count
  const getVisibleCount = () => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth < 640) return 1;  // Mobile: 1 card
    if (window.innerWidth < 1024) return 2; // Tablet: 2 cards  
    return 3; // Desktop: 3 cards
  };
  
  const filterCategories = ["All", "Royalty", "Creatures", "Cursed", "Woodland"];
  
  const costumeInspiration = [
    {
      id: 1, 
      title: "Cursed Cinderella & Blood Prince",
      image: "/img/costumes/Cinderella.png",
      description: "A tattered ballgown soaked in crimson and a cracked glass slipper mark Cinderella's midnight bargain. Her Prince wears a tarnished crown and velvet doublet, his hands dripping red as he claims his bride in blood.",
      category: "Royalty"
    },
    {
      id: 2,
      title: "Red Riding Hood & The Wolf",
      image: "/img/costumes/LittleRedRidingHood2.png",
      description: "Red cloaked in rags carries a basket of bones and black bread, her arms scarred with bite marks. At her side snarls the Wolf, claws and muzzle dripping red, cloaked in tattered furs from the deep woods.",
      category: "Woodland"
    },
    {
      id: 3,
      title: "Pinocchio & Geppetto the Butcher",
      image: "/img/costumes/Pinocchio.png",
      description: "Pinocchio appears as a cracked wooden puppet with a grotesque nose like a bloody stake, clutching a basket of bones. At his side, Geppetto looms in a bloodstained apron, chisel in hand, eyes cold as a butcher of his own creations.",
      category: "Cursed"
    },
    {
      id: 4,
      title: "Hansel & Gretel — Witch's Apprentices",
      image: "/img/costumes/hanselGetel.png",
      description: "Hansel and Gretel stand in grimy peasant garb, aprons streaked with soot and blood. Gretel clutches a tray of gingerbread shaped like human limbs while Hansel grips a cleaver and oven door, their faces hardened by the witch's cruel lessons.",
      category: "Cursed"
    },
    {
      id: 5,
      title: "Snow White & Goblin Dwarf",
      image: "/img/costumes/snow-white.png",
      description: "Snow White laughs with crimson on her lips, a poisoned apple clutched in her hand. At her side, a grotesque dwarf grins wide, raising a mug brimming with brains, both reveling in their wicked feast as if it were a party toast.",
      category: "Cursed"
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
    <div className="min-h-screen bg-background relative">
      <main className="pt-20 md:pt-24 relative z-10">
        {/* <CSSFogBackground /> */}
        <section className="py-16 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="relative">
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
                visible={getVisibleCount()}
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
                    <h3 className="font-subhead text-xl mb-4 text-accent-gold">
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
              <h2 className="font-subhead text-3xl text-center mb-6 text-accent-red">
                Costume Contest Prizes
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="font-heading text-4xl mb-2 text-accent-gold">💀</div>
                  <h3 className="font-subhead text-lg mb-2 text-accent-gold">Most Twisted</h3>
                  <p className="font-body text-sm text-muted-foreground">
                    The costume that takes the darkest, most creative spin on a classic fairytale
                  </p>
                </div>
                <div className="text-center">
                  <div className="font-heading text-4xl mb-2 text-accent-gold">📜</div>
                  <h3 className="font-subhead text-lg mb-2 text-accent-gold">Master Storyteller</h3>
                  <p className="font-body text-sm text-muted-foreground">
                    The most creative and original fairytale character interpretation
                  </p>
                </div>
                <div className="text-center">
                  <div className="font-heading text-4xl mb-2 text-accent-gold">👥</div>
                  <h3 className="font-subhead text-lg mb-2 text-accent-gold">Group Effort Excellence</h3>
                  <p className="font-body text-sm text-muted-foreground">
                    Best coordinated group or couple costume
                  </p>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <p className="font-body text-muted-foreground mb-4">
                  Judging will take place during the Costume Parade at 9:00 PM. 
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