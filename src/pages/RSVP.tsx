import { useState } from "react";
import NavBar from "@/components/NavBar";
import { formatEventShort, formatEventTime } from "@/lib/event";
import Footer from "@/components/Footer";
import FormField from "@/components/FormField";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const RSVP = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    guestCount: 1,
    costumeIdea: "",
    dietary: "",
    contribution: ""
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (formData.guestCount < 1 || formData.guestCount > 10) {
      newErrors.guestCount = "Guest count must be between 1 and 10";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // TODO v3: Connect to Supabase -> Mailjet flow
      console.log("RSVP Form Data:", formData);
      
      toast({
        title: "RSVP Received!",
        description: "Your twisted tale reservation has been confirmed. Prepare for the unexpected...",
        variant: "default"
      });
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        guestCount: 1,
        costumeIdea: "",
        dietary: "",
        contribution: ""
      });
    }
  };

  const handleInputChange = (name: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="pt-20">
        <section className="py-16 px-6">
          <div className="container mx-auto max-w-3xl">
            <h1 className="font-heading text-4xl md:text-6xl text-center mb-8 text-shadow-gothic">
              Join the Twisted Tale
            </h1>
            
            <p className="font-body text-lg text-center mb-12 text-muted-foreground max-w-2xl mx-auto">
              Secure your place at the most anticipated Halloween event of the year. 
              But beware - not all who enter leave unchanged...
            </p>
            
            <div className="bg-card p-8 rounded-lg border border-accent-purple/30 shadow-lg">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Required Fields */}
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    label="Full Name *"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={(value) => handleInputChange("name", value)}
                    error={errors.name}
                    placeholder="Enter your real name... or your character's"
                  />
                  
                  <FormField
                    label="Email Address *"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(value) => handleInputChange("email", value)}
                    error={errors.email}
                    placeholder="your.email@domain.com"
                  />
                </div>
                
                <FormField
                  label="Number of Guests *"
                  name="guestCount"
                  type="number"
                  value={formData.guestCount}
                  onChange={(value) => handleInputChange("guestCount", parseInt(value) || 1)}
                  error={errors.guestCount}
                  min={1}
                  max={10}
                  placeholder="1"
                />
                
                {/* Optional Fields */}
                <div className="border-t border-accent-purple/30 pt-6">
                  <h3 className="font-subhead text-xl mb-4 text-accent-gold">
                    Optional Details (Helps Us Prepare)
                  </h3>
                  
                  <div className="space-y-4">
                    <FormField
                      label="Costume Concept"
                      name="costumeIdea"
                      type="textarea"
                      value={formData.costumeIdea}
                      onChange={(value) => handleInputChange("costumeIdea", value)}
                      placeholder="What twisted fairytale character will you embody? Give us a hint..."
                      rows={3}
                    />
                    
                    <FormField
                      label="Dietary Restrictions"
                      name="dietary"
                      type="textarea" 
                      value={formData.dietary}
                      onChange={(value) => handleInputChange("dietary", value)}
                      placeholder="Any allergies, dietary preferences, or foods that might poison you?"
                      rows={2}
                    />
                    
                    <FormField
                      label="Potluck Contribution"
                      name="contribution"
                      type="textarea"
                      value={formData.contribution}
                      onChange={(value) => handleInputChange("contribution", value)}
                      placeholder="What twisted treat will you bring to share? Describe your dish and its dark story..."
                      rows={3}
                    />
                  </div>
                </div>
                
                {/* Submit */}
                <div className="pt-6 text-center">
                  <Button
                    type="submit"
                    className="bg-accent-red hover:bg-accent-red/80 text-ink font-subhead text-lg px-12 py-4 glow-gold motion-safe hover:scale-105 transition-transform"
                  >
                    Seal Your Fate
                  </Button>
                  
                  <p className="font-body text-xs text-muted-foreground mt-4 max-w-md mx-auto">
                    By submitting this RSVP, you agree to participate in interactive storytelling 
                    and acknowledge that some content may be intense. 18+ recommended.
                  </p>
                </div>
              </form>
            </div>
            
            {/* Event Details Reminder */}
            <div className="mt-12 bg-bg-2 p-6 rounded-lg border border-accent-purple/30">
              <h3 className="font-subhead text-xl mb-4 text-accent-gold text-center">
                Event Details
              </h3>
              <div className="grid md:grid-cols-3 gap-4 text-center font-body text-sm">
                <div>
                  <span className="block font-subhead text-accent-purple">Date</span>
                  <span className="text-muted-foreground">{formatEventShort()}</span>
                </div>
                <div>
                  <span className="block font-subhead text-accent-purple">Time</span>
                  <span className="text-muted-foreground">{formatEventTime()} - Late</span>
                </div>
                <div>
                  <span className="block font-subhead text-accent-purple">Attire</span>
                  <span className="text-muted-foreground">Twisted Fairytale Costumes</span>
                </div>
              </div>
              
              <p className="text-center text-xs text-muted-foreground mt-4">
                Location details will be provided upon RSVP confirmation via email.
              </p>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default RSVP;