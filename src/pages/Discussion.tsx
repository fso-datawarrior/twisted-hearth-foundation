import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const Discussion = () => {
  // TODO v2: Connect to Supabase for real guestbook functionality
  const placeholderMessages = [
    {
      id: 1,
      author: "The Mad Hatter",
      message: "Last year's rabbit hole was deeper than expected. Can't wait to see what twisted reality awaits us this time!",
      timestamp: "2023-11-01",
      costume: "Alice in Corporate Wonderland"
    },
    {
      id: 2,
      author: "Red Riding Hood",
      message: "The wolf wasn't the real villain after all... Looking forward to another night of revelations!",
      timestamp: "2023-10-28",
      costume: "Surveillance State Little Red"
    },
    {
      id: 3,
      author: "Midnight Cinderella",
      message: "Still finding glass in my shoes from the last party. Worth every cut! 🩸✨",
      timestamp: "2023-10-25", 
      costume: "Post-Divorce Princess"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="pt-20">
        <section className="py-16 px-6">
          <div className="container mx-auto max-w-4xl">
            <h1 className="font-heading text-4xl md:text-6xl text-center mb-8 text-shadow-gothic">
              The Dark Guestbook
            </h1>
            
            <p className="font-body text-lg text-center mb-12 text-muted-foreground max-w-3xl mx-auto">
              Share your thoughts, theories, and twisted tales. What darkness will you bring 
              to this year's celebration? Past guests, tell us your secrets...
            </p>
            
            {/* Coming Soon Message */}
            <div className="text-center mb-12">
              <div className="bg-card p-8 rounded-lg border border-accent-purple/30 max-w-2xl mx-auto">
                <div className="font-heading text-5xl mb-4 text-accent-gold">📖</div>
                <h2 className="font-subhead text-2xl mb-4 text-accent-red">
                  Interactive Guestbook Opening Soon
                </h2>
                <p className="font-body text-muted-foreground mb-6">
                  We're preparing a magical scroll where guests can share their twisted tales, 
                  theories about this year's theme, and messages for fellow adventurers.
                </p>
                <p className="font-body text-sm text-muted-foreground italic">
                  "Some stories are best told in whispers... others in digital ink."
                </p>
              </div>
            </div>
            
            {/* Sample Messages from Past Events */}
            <div className="mb-12">
              <h2 className="font-subhead text-2xl text-center mb-8 text-accent-gold">
                Echoes from Past Celebrations
              </h2>
              
              <div className="space-y-6">
                {placeholderMessages.map((message) => (
                  <div 
                    key={message.id}
                    className="bg-card p-6 rounded-lg border border-accent-purple/30 hover:border-accent-gold/50 transition-colors motion-safe"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-subhead text-lg text-accent-purple">
                          {message.author}
                        </h3>
                        <p className="font-body text-sm text-muted-foreground">
                          {message.costume}
                        </p>
                      </div>
                      <span className="font-body text-xs text-muted-foreground">
                        {message.timestamp}
                      </span>
                    </div>
                    <p className="font-body text-muted-foreground">
                      "{message.message}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Upcoming Features */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-bg-2 p-6 rounded-lg border border-accent-purple/30">
                <h3 className="font-subhead text-xl mb-4 text-accent-gold">Share Your Story</h3>
                <ul className="font-body text-sm text-muted-foreground space-y-2">
                  <li>• Post messages before, during, and after the event</li>
                  <li>• Share costume inspiration and character backstories</li>
                  <li>• Connect with other twisted tale enthusiasts</li>
                  <li>• Theory crafting about interactive elements</li>
                </ul>
              </div>
              
              <div className="bg-bg-2 p-6 rounded-lg border border-accent-purple/30">
                <h3 className="font-subhead text-xl mb-4 text-accent-gold">Community Features</h3>
                <ul className="font-body text-sm text-muted-foreground space-y-2">
                  <li>• React to messages with fairytale emojis</li>
                  <li>• Anonymous posting option for deep secrets</li>
                  <li>• Photo sharing alongside messages</li>
                  <li>• Archive of messages from past years</li>
                </ul>
              </div>
            </div>
            
            {/* Contact for Early Access */}
            <div className="text-center">
              <div className="bg-card p-8 rounded-lg border border-accent-red/50 max-w-2xl mx-auto">
                <h3 className="font-subhead text-2xl mb-4 text-accent-red">
                  Join the Conversation Early
                </h3>
                <p className="font-body text-muted-foreground mb-6">
                  Want to share your twisted tale concepts before the guestbook launches? 
                  Have burning questions about this year's theme? Reach out to your hosts directly.
                </p>
                <Button 
                  asChild 
                  variant="destructive"
                  className="bg-accent-red hover:bg-accent-red/80 glow-gold font-subhead px-8 py-3"
                >
                  <a href="/contact">Contact the Hosts</a>
                </Button>
                
                <p className="font-body text-xs text-muted-foreground mt-4 italic">
                  "The best conversations happen in the shadows between fairy tales..."
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

export default Discussion;