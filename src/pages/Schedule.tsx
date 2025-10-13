import Footer from "@/components/Footer";
// import CSSFogBackground from "@/components/CSSFogBackground";
import { formatEventTime } from "@/lib/event";

const Schedule = () => {
  const scheduleItems = [
    {
      time: "6:30 PM",
      title: "Book Opens: Welcome to the Dark Forest",
      description: "Arrival and tour (self-guided or otherwise). The story starts when you crack open the book as twilight falls. Enter the story with your own characters and begin wending your way through the evening's twisted tales.",
      type: "arrival"
    },
    {
      time: "7:15 PM", 
      title: "Welcome Gathering & Poison Toasts",
      description: "Signature cocktails will be available as you meander the space. Meet your fellow travelers on this dark journey.",
      type: "social"
    },
    {
      time: "7:30 PM",
      title: "Vignette Loop Begins", 
      description: "Wander from scene to scene and see if you can spot the fairytale origins. Let your inner narrator take charge and suggest how you think the story got off track and if there is a way back....",
      type: "performance"
    },
    {
      time: "7:45 PM",
      title: "Feast of the Damned",
      description: "Much like Jack Sprat's wife, the twisted fairytale potluck is ever growing as people arrive. Each dish tells its own story as the author's dictate",
      type: "feast"
    },
    {
      time: "8:00 PM",
      title: "Speed Pong Tournament Begins",
      description: "The annual battle where every miss is a step closer to the underworld of elimination. Will you survive this speed gauntlet of the cursed cups?",
      type: "contest"
    },
    {
      time: "9:00 PM",
      title: "Costume Court",
      description: "Showcase your twisted fairytale, and be ready to tell your tale! Judges evaluate creativity and presentation of your dark disguise.",
      type: "dance"
    },
    {
      time: "10:00 PM",
      title: "The Story Unfolds",
      description: "The end is not yet written. Will you hunt for new adventures, new characters to engage or simply have more libations? The tale is yours to craft.",
      type: "story"
    },
    {
      time: "10:45 PM",
      title: "Final Toast / Last Dance",
      description: "As the witching hour approaches, we gather once more for toast and pictures. The music plays on, but some dances never end...",
      type: "finale"
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "arrival": return "text-accent-gold border-accent-gold"; // 6:30 PM - Warm welcome
      case "social": return "text-accent-green border-accent-green"; // 7:15 PM - Fresh, social
      case "performance": return "text-[#B794F6] border-[#B794F6]"; // 7:30 PM - Bright purple, mysterious
      case "feast": return "text-[#F59E0B] border-[#F59E0B]"; // 7:45 PM - Amber, food-related
      case "contest": return "text-accent-gold border-accent-gold"; // 8:00 PM - Competitive gold
      case "dance": return "text-[#06B6D4] border-[#06B6D4]"; // 9:00 PM - Cyan, showcase
      case "finale": return "text-accent-red border-accent-red"; // 10:45 PM - Climactic red
      default: return "text-[#3B82F6] border-[#3B82F6]"; // 10:00 PM - Blue, reflective
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* GLSL animated smoke effect */}
      {/* <CSSFogBackground /> */}
      
      <main className="pt-20 md:pt-24 relative z-10">
        <section className="py-16 px-6">
          <div className="container mx-auto max-w-4xl">
            <div className="relative">
              <h1 className="font-heading text-4xl md:text-6xl text-center mb-8 text-shadow-gothic">
                Schedule of Dark Delights
              </h1>
            </div>
            
            <p className="font-body text-lg text-center mb-12 text-muted-foreground max-w-3xl mx-auto">
              The evening unfolds like a storybook, with each chapter bringing new twists and turns. 
              Come prepared to participate - this isn't a passive experience.
            </p>
            
            <div className="space-y-6">
              <ol role="list" className="space-y-6">
                {scheduleItems.map((item, index) => (
                  <li 
                    key={index}
                    className="bg-card p-6 rounded-lg border border-accent-purple/30 hover:border-accent-gold/50 transition-colors motion-safe relative"
                  >
                    
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="flex-shrink-0">
                        <time 
                          dateTime={item.time}
                          className={`font-subhead text-2xl font-bold ${getTypeColor(item.type).split(' ')[0]} bg-bg-2 px-4 py-2 rounded-lg border-2 ${getTypeColor(item.type).split(' ')[1]} block`}
                        >
                          {item.time}
                        </time>
                      </div>
                      
                      <div className="flex-grow">
                        <h3 className="font-subhead text-xl mb-2 text-accent-gold">
                          {item.title}
                        </h3>
                        <p className="font-body text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            
            <div className="mt-16 grid md:grid-cols-2 gap-8">
              <div className="bg-bg-2 p-8 rounded-lg border border-accent-purple/30">
                <h2 className="font-subhead text-2xl mb-4 text-accent-red">Important Notes</h2>
                <ul className="font-body text-muted-foreground space-y-2">
                  <li>• Interactive experiences require participation</li>
                  <li>• <strong className="text-accent-red">Age 21+ only</strong> - This is an adult-only event</li>
                  <li>• Some risqué costumes may be seen</li>
                  <li>• <strong className="text-accent-gold">Photography with consent only</strong> - Ask before taking photos</li>
                  <li>• Stay in character for the full experience</li>
                </ul>
              </div>
              
              <div className="bg-bg-2 p-8 rounded-lg border border-accent-purple/30">
                <h2 className="font-subhead text-2xl mb-4 text-accent-gold">What to Bring</h2>
                <ul className="font-body text-muted-foreground space-y-2">
                  <li>• Your twisted fairytale costume</li>
                  <li>• A potluck dish (fairytale themed preferred)</li>
                  <li>• An open mind and brave heart</li>
                  <li>• <em className="text-accent-purple italic">Under development</em> - More surprises await!</li>
                </ul>
              </div>
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

export default Schedule;