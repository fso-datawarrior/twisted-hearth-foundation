import { useState, useRef } from "react";
import { formatEventShort, formatEventTime } from "@/lib/event";
import Footer from "@/components/Footer";
// import CSSFogBackground from "@/components/CSSFogBackground";
import FormField from "@/components/FormField";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import RequireAuth from "@/components/RequireAuth";

const RSVP = () => {
  const { toast } = useToast();
  const startRef = useRef(Date.now());
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    guestCount: 1,
    costumeIdea: "",
    dietary: "",
    contribution: "",
    nickname: "" // Honeypot field
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Anti-spam: timing guard and honeypot
    if (Date.now() - startRef.current < 1000 || formData.nickname) {
      toast({
        title: "RSVP Received!",
        description: "Your twisted tale reservation has been confirmed. Check your email for location details.",
        variant: "default"
      });
      // Reset form
      setFormData({
        name: "",
        email: "",
        guestCount: 1,
        costumeIdea: "",
        dietary: "",
        contribution: "",
        nickname: ""
      });
      return;
    }
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        const idem = crypto?.randomUUID?.() ?? String(Date.now());
        
        // Call Supabase RPC to save RSVP
        const { data, error: rpcError } = await supabase.rpc("submit_rsvp", {
          p_name: formData.name,
          p_email: formData.email.toLowerCase().trim(),
          p_num_guests: formData.guestCount,
          p_costume_idea: formData.costumeIdea || null,
          p_dietary: formData.dietary || null,
          p_contributions: formData.contribution || null,
          p_idempotency: idem,
        });

        if (rpcError) {
          console.error("RPC Error:", rpcError);
          throw new Error("Failed to save RSVP");
        }

        const rsvpId = Array.isArray(data) ? data[0]?.rsvp_id : (data as any)?.rsvp_id;
        if (!rsvpId) {
          throw new Error("Invalid RSVP response");
        }
        console.log("RSVP saved successfully:", rsvpId);

        // Send confirmation email via Edge Function
        try {
          const { error: emailError } = await supabase.functions.invoke("send-rsvp-confirmation", {
            body: {
              rsvpId: rsvpId,
              name: formData.name,
              email: formData.email,
              guests: formData.guestCount,
            },
          });

          if (emailError) {
            console.warn("Email send failed:", emailError);
            // Don't fail the RSVP if email fails
          }
        } catch (emailErr) {
          console.warn("Email function error:", emailErr);
          // Email failure doesn't block RSVP success
        }
        
        toast({
          title: "RSVP Received!",
          description: "Your twisted tale reservation has been confirmed. Check your email for location details.",
          variant: "default"
        });
        
        // Reset form
        setFormData({
          name: "",
          email: "",
          guestCount: 1,
          costumeIdea: "",
          dietary: "",
          contribution: "",
          nickname: ""
        });
      } catch (error) {
        console.error("RSVP Error:", error);
        toast({
          title: "Error",
          description: "We couldn't save your RSVP. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsSubmitting(false);
      }
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
    <RequireAuth>
      <div className="min-h-screen bg-background relative">
        <main className="pt-20 relative z-10">
          {/* <CSSFogBackground /> */}
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
              <form onSubmit={handleSubmit} className="space-y-6" aria-busy={String(isSubmitting)}>
                {/* Honeypot field - anti-spam */}
                <input 
                  type="text" 
                  name="nickname" 
                  tabIndex={-1} 
                  autoComplete="off" 
                  className="hidden" 
                  aria-hidden="true"
                  value={formData.nickname}
                  onChange={(e) => handleInputChange("nickname", e.target.value)}
                />
                
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
                    disabled={isSubmitting}
                    className="bg-accent-red hover:bg-accent-red/80 text-ink font-subhead text-lg px-12 py-4 glow-gold motion-safe hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Submitting…" : "Seal Your Fate"}
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
                  <span className="block font-subhead text-accent-gold">Date</span>
                  <span className="text-muted-foreground">{formatEventShort()}</span>
                </div>
                <div>
                  <span className="block font-subhead text-accent-gold">Time</span>
                  <span className="text-muted-foreground">{formatEventTime()} - Late</span>
                </div>
                <div>
                  <span className="block font-subhead text-accent-gold">Attire</span>
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
    </RequireAuth>
  );
};

export default RSVP;