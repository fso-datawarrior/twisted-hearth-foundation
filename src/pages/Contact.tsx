
import Footer from "@/components/Footer";
import { Mail, MessageCircle, Calendar } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <main className="pt-20">
        <section className="py-16 px-6">
          <div className="container mx-auto max-w-4xl">
            <h1 className="font-heading text-4xl md:text-6xl text-center mb-8 text-shadow-gothic">
              Contact Your Hosts
            </h1>
            
            <p className="font-body text-lg text-center mb-12 text-muted-foreground max-w-3xl mx-auto">
              Questions about the twisted celebration? Need help with your character concept? 
              Your hosts Jamie & Kat are here to guide you through the darkness.
            </p>
            
            {/* Host Cards */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-card p-8 rounded-lg border border-accent-purple/30 text-center">
                <div className="w-24 h-24 bg-accent-purple rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="font-heading text-3xl text-ink">J</span>
                </div>
                <h2 className="font-subhead text-2xl mb-2 text-accent-gold">Jamie Ruth</h2>
                <p className="font-body text-muted-foreground mb-4">
                  Master of Dark Logistics & Twisted Event Planning
                </p>
                <p className="font-body text-sm text-muted-foreground mb-4">
                  Specializes in immersive storytelling, costume guidance, and ensuring 
                  every guest's journey into darkness is perfectly orchestrated.
                </p>
                <a 
                  href="mailto:jamie@partytillyou.rip"
                  className="inline-flex items-center font-subhead text-accent-purple hover:text-accent-gold transition-colors motion-safe focus-visible"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  jamie@partytillyou.rip
                </a>
              </div>
              
              <div className="bg-card p-8 rounded-lg border border-accent-purple/30 text-center">
                <div className="w-24 h-24 bg-accent-red rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="font-heading text-3xl text-ink">K</span>
                </div>
                <h2 className="font-subhead text-2xl mb-2 text-accent-gold">Kat Ruth</h2>
                <p className="font-body text-muted-foreground mb-4">
                  Curator of Culinary Chaos & Atmospheric Enchantments
                </p>
                <p className="font-body text-sm text-muted-foreground mb-4">
                  Expert in twisted cocktail creation, interactive performance design, 
                  and transforming spaces into otherworldly realms.
                </p>
                <a 
                  href="mailto:kat@partytillyou.rip"
                  className="inline-flex items-center font-subhead text-accent-purple hover:text-accent-gold transition-colors motion-safe focus-visible"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  kat@partytillyou.rip
                </a>
              </div>
            </div>
            
            {/* Contact Methods */}
            <div className="mb-12">
              <h2 className="font-subhead text-3xl text-center mb-8 text-accent-gold">
                Ways to Reach Us
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-bg-2 p-6 rounded-lg border border-accent-purple/30 text-center">
                  <Mail className="w-12 h-12 text-accent-purple mx-auto mb-4" />
                  <h3 className="font-subhead text-lg mb-2 text-accent-gold">Email</h3>
                  <p className="font-body text-sm text-muted-foreground mb-4">
                    Best for detailed questions, costume consultations, or sharing your twisted tale concepts.
                  </p>
                  <a 
                    href="mailto:hosts@partytillyou.rip"
                    className="font-subhead text-accent-purple hover:text-accent-gold transition-colors motion-safe focus-visible"
                  >
                    hosts@partytillyou.rip
                  </a>
                </div>
                
                <div className="bg-bg-2 p-6 rounded-lg border border-accent-purple/30 text-center">
                  <MessageCircle className="w-12 h-12 text-accent-green mx-auto mb-4" />
                  <h3 className="font-subhead text-lg mb-2 text-accent-gold">Quick Questions</h3>
                  <p className="font-body text-sm text-muted-foreground mb-4">
                    For urgent RSVP changes, last-minute questions, or day-of-event coordination.
                  </p>
                  <p className="font-subhead text-accent-green">
                    Response within 24 hours
                  </p>
                </div>
                
                <div className="bg-bg-2 p-6 rounded-lg border border-accent-purple/30 text-center">
                  <Calendar className="w-12 h-12 text-accent-red mx-auto mb-4" />
                  <h3 className="font-subhead text-lg mb-2 text-accent-gold">Consultation</h3>
                  <p className="font-body text-sm text-muted-foreground mb-4">
                    Need help developing your character or understanding the interactive elements?
                  </p>
                  <p className="font-subhead text-accent-red">
                    Schedule a call
                  </p>
                </div>
              </div>
            </div>
            
            {/* FAQ Section */}
            <div className="mb-12">
              <h2 className="font-subhead text-3xl text-center mb-8 text-accent-gold">
                Frequently Asked Questions
              </h2>
              
              <div className="space-y-4">
                <div className="bg-card p-6 rounded-lg border border-accent-purple/30">
                  <h3 className="font-subhead text-lg mb-2 text-accent-purple">
                    What if I can't think of a costume idea?
                  </h3>
                  <p className="font-body text-muted-foreground">
                    Don't worry! We offer complimentary costume consultations. Email us your 
                    interests, favorite fairytales, or current concerns about society, and we'll 
                    help you craft the perfect twisted character.
                  </p>
                </div>
                
                <div className="bg-card p-6 rounded-lg border border-accent-purple/30">
                  <h3 className="font-subhead text-lg mb-2 text-accent-purple">
                    How interactive are the performances?
                  </h3>
                  <p className="font-body text-muted-foreground">
                    Very! You'll receive story cards upon arrival that determine your path through 
                    the evening. Some guests become key characters in the unfolding narrative. 
                    Participation is encouraged but never forced.
                  </p>
                </div>
                
                <div className="bg-card p-6 rounded-lg border border-accent-purple/30">
                  <h3 className="font-subhead text-lg mb-2 text-accent-purple">
                    Can I bring additional guests not on my RSVP?
                  </h3>
                  <p className="font-body text-muted-foreground">
                    Please contact us first! We prepare interactive elements based on expected 
                    attendance. Last-minute additions may be accommodated depending on space 
                    and story requirements.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Location Privacy Notice */}
            <div className="text-center">
              <div className="bg-card p-8 rounded-lg border border-accent-gold/50 max-w-2xl mx-auto">
                <h3 className="font-subhead text-2xl mb-4 text-accent-gold">
                  Location Details
                </h3>
                <p className="font-body text-muted-foreground mb-4">
                  For privacy and security, the exact location of our twisted celebration 
                  is provided only to confirmed guests via email after RSVP submission.
                </p>
                <p className="font-body text-sm text-muted-foreground italic">
                  "Some secrets are best kept until the final moment... 
                  when you step across the threshold into our dark fairytale realm."
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

export default Contact;