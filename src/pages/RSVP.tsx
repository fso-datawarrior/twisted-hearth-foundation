import { useState, useRef, useEffect } from "react";
import { formatEventShort, formatEventTime } from "@/lib/event";
import Footer from "@/components/Footer";
import FormField from "@/components/FormField";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import RequireAuth from "@/components/RequireAuth";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Pencil, Trash2, UtensilsCrossed, Plus, Minus } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { z } from "zod";

interface PotluckItem {
  id: string;
  item_name: string;
  notes: string | null;
  is_vegan: boolean;
  is_gluten_free: boolean;
  created_at: string;
  user_id: string;
  user_email: string;
}

const potluckItemSchema = z.object({
  item_name: z.string().min(1, "Dish name is required").max(80, "Dish name must be 80 characters or less"),
  notes: z.string().max(140, "Notes must be 140 characters or less").optional(),
});

const RSVP = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const startRef = useRef(Date.now());
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    guestCount: 1,
    costumeIdea: "",
    dietary: "",
    nickname: "" // Honeypot field
  });

  // Auto-populate email when user logs in
  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({ ...prev, email: user.email || "" }));
    }
  }, [user]);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Potluck contribution states
  const [potluckItems, setPotluckItems] = useState<PotluckItem[]>([]);
  const [dishName, setDishName] = useState("");
  const [dishNotes, setDishNotes] = useState("");
  const [isVegan, setIsVegan] = useState(false);
  const [isGlutenFree, setIsGlutenFree] = useState(false);
  const [isAddingDish, setIsAddingDish] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<PotluckItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Load user's potluck contributions
  useEffect(() => {
    const loadPotluckItems = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('potluck_items')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading potluck items:', error);
        return;
      }

      setPotluckItems(data || []);
    };

    loadPotluckItems();
  }, []);

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
        nickname: ""
      });
      return;
    }
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        const idem = crypto?.randomUUID?.() ?? String(Date.now());
        
        // Call Supabase RPC to save RSVP
        const { data, error: rpcError } = await (supabase.rpc as any)("submit_rsvp", {
          p_name: formData.name,
          p_email: formData.email.toLowerCase().trim(),
          p_num_guests: formData.guestCount,
          p_costume_idea: formData.costumeIdea || null,
          p_dietary: formData.dietary || null,
          p_contributions: null,
          p_idempotency: idem,
        });

        if (rpcError) {
          console.error("RPC Error:", rpcError);
          throw new Error("Failed to save RSVP");
        }

        const rsvpId = data;
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

  const handleAddDish = async () => {
    setIsAddingDish(true);
    try {
      const validation = potluckItemSchema.safeParse({
        item_name: dishName,
        notes: dishNotes || undefined,
      });

      if (!validation.success) {
        toast({
          title: "Validation Error",
          description: validation.error.errors[0].message,
          variant: "destructive"
        });
        setIsAddingDish(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to add a contribution",
          variant: "destructive"
        });
        setIsAddingDish(false);
        return;
      }

      if (editingItem) {
        // Update existing item
        const { error } = await supabase
          .from('potluck_items')
          .update({
            item_name: dishName,
            notes: dishNotes || null,
            is_vegan: isVegan,
            is_gluten_free: isGlutenFree,
          })
          .eq('id', editingItem.id);

        if (error) throw error;

        setPotluckItems(prev => prev.map(item => 
          item.id === editingItem.id 
            ? { ...item, item_name: dishName, notes: dishNotes || null, is_vegan: isVegan, is_gluten_free: isGlutenFree }
            : item
        ));
        toast({
          title: "Success!",
          description: "Contribution updated!",
          variant: "default"
        });
      } else {
        // Insert new item
        const { data, error } = await supabase
          .from('potluck_items')
          .insert({
            user_id: user.id,
            item_name: dishName,
            notes: dishNotes || null,
            is_vegan: isVegan,
            is_gluten_free: isGlutenFree,
            user_email: user.email || '',
          })
          .select()
          .single();

        if (error) throw error;

        setPotluckItems(prev => [data, ...prev]);

        // Send confirmation email
        await supabase.functions.invoke('send-contribution-confirmation', {
          body: {
            contributorEmail: user.email,
            contributorName: user.user_metadata?.full_name || user.email?.split('@')[0],
            dishName,
            notes: dishNotes || undefined,
            isVegan,
            isGlutenFree,
          }
        });

        if (isVegan || isGlutenFree) {
          setShowConfirmDialog(true);
        } else {
          toast({
            title: "Success!",
            description: "Contribution added to feast!",
            variant: "default"
          });
        }
      }

      // Reset form
      setDishName("");
      setDishNotes("");
      setIsVegan(false);
      setIsGlutenFree(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error adding dish:', error);
      toast({
        title: "Error",
        description: "Failed to add contribution",
        variant: "destructive"
      });
    } finally {
      setIsAddingDish(false);
    }
  };

  const handleEditDish = (item: PotluckItem) => {
    setEditingItem(item);
    setDishName(item.item_name);
    setDishNotes(item.notes || "");
    setIsVegan(item.is_vegan);
    setIsGlutenFree(item.is_gluten_free);
    
    // Scroll to contribution form
    const formElement = document.getElementById('contribution-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleDeleteDish = async (id: string) => {
    try {
      const { error } = await supabase
        .from('potluck_items')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setPotluckItems(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Success!",
        description: "Contribution removed",
        variant: "default"
      });
    } catch (error) {
      console.error('Error deleting dish:', error);
      toast({
        title: "Error",
        description: "Failed to remove contribution",
        variant: "destructive"
      });
    } finally {
      setItemToDelete(null);
    }
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setDishName("");
    setDishNotes("");
    setIsVegan(false);
    setIsGlutenFree(false);
  };

  return (
    <RequireAuth>
      <div className="min-h-screen bg-background relative">
        <main className="pt-20 relative z-10">
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
              <form onSubmit={handleSubmit} className="space-y-6" aria-busy={isSubmitting}>
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
                
                <div>
                  <Label className="font-subhead text-accent-gold mb-2 block">
                    Number of Guests <span className="text-accent-red">*</span>
                  </Label>
                  <div className="flex items-center justify-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleInputChange("guestCount", Math.max(1, formData.guestCount - 1))}
                      disabled={formData.guestCount <= 1}
                      className="h-12 w-12 border-2 border-accent-gold text-accent-gold hover:bg-accent-gold/10"
                    >
                      <Minus className="h-5 w-5" />
                    </Button>
                    
                    <div className="flex-shrink-0 w-20 h-12 flex items-center justify-center bg-background border-2 border-accent-purple/30 rounded-lg">
                      <span className="text-xl font-semibold text-white">{formData.guestCount}</span>
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleInputChange("guestCount", Math.min(10, formData.guestCount + 1))}
                      disabled={formData.guestCount >= 10}
                      className="h-12 w-12 border-2 border-accent-gold text-accent-gold hover:bg-accent-gold/10"
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                  {errors.guestCount && (
                    <p className="text-sm text-accent-red mt-1">{errors.guestCount}</p>
                  )}
                </div>
                
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

            {/* Potluck Contribution Section */}
            <div id="contribution-form" className="bg-card p-6 rounded-lg border border-accent-purple/30 shadow-lg mt-8">
              <h2 className="text-2xl font-display text-white mb-4 flex items-center gap-2">
                <UtensilsCrossed className="h-6 w-6 text-accent-gold" />
                {editingItem ? "Edit Your Contribution" : "Add Your Contribution"}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Dish Name <span className="text-accent-red">*</span>
                  </label>
                  <input
                    type="text"
                    value={dishName}
                    onChange={(e) => setDishName(e.target.value)}
                    maxLength={80}
                    placeholder="e.g., Enchanted Apple Pie"
                    className="w-full px-4 py-2 rounded-lg bg-background border border-input text-white focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/20 outline-none transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">{dishName.length}/80 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={dishNotes}
                    onChange={(e) => setDishNotes(e.target.value)}
                    maxLength={140}
                    placeholder="Any additional details..."
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg bg-background border border-input text-white focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/20 outline-none transition-all resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">{dishNotes.length}/140 characters</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="vegan"
                      checked={isVegan}
                      onCheckedChange={(checked) => setIsVegan(checked as boolean)}
                    />
                    <label htmlFor="vegan" className="text-sm text-gray-300 cursor-pointer">
                      🌱 This dish is Vegan
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="glutenFree"
                      checked={isGlutenFree}
                      onCheckedChange={(checked) => setIsGlutenFree(checked as boolean)}
                    />
                    <label htmlFor="glutenFree" className="text-sm text-gray-300 cursor-pointer">
                      🌾 This dish is Gluten-Free
                    </label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAddDish}
                    disabled={isAddingDish || !dishName.trim()}
                    className="flex-1 bg-accent-red text-white px-6 py-3 rounded-lg font-semibold hover:bg-accent-red/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed glow-gold font-subhead"
                  >
                    {isAddingDish ? "Adding..." : editingItem ? "Update Contribution" : "Add to Feast"}
                  </button>
                  {editingItem && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-6 py-3 rounded-lg font-semibold border border-accent-purple/30 text-accent-purple hover:bg-accent-purple/10 transition-all duration-300"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* User's Contributions List */}
            {potluckItems.length > 0 && (
              <div className="bg-card p-6 rounded-lg border border-accent-purple/30 shadow-lg mt-8">
                <h2 className="text-2xl font-display text-white mb-4">Your Contributions</h2>
                <ScrollArea className="max-h-96 pr-4">
                  <div className="space-y-3">
                    {potluckItems.map((item) => (
                      <Card key={item.id} className="border-2 border-accent-gold bg-background/50">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-white flex items-center gap-2">
                                {item.item_name}
                                {item.is_vegan && <span title="Vegan">🌱</span>}
                                {item.is_gluten_free && <span title="Gluten-Free">🌾</span>}
                              </h3>
                              {item.notes && <p className="text-sm text-gray-400 mt-1">{item.notes}</p>}
                              <p className="text-xs text-gray-500 mt-1">
                                Added {new Date(item.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => handleEditDish(item)}
                                className="p-2 text-accent-gold hover:bg-accent-gold/10 rounded transition-colors"
                                title="Edit"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setItemToDelete(item.id)}
                                className="p-2 text-accent-red hover:bg-accent-red/10 rounded transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
            
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

      {/* Dietary Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-card border border-accent-purple/30">
          <DialogHeader>
            <DialogTitle className="text-white">Contribution Added Successfully! 🎉</DialogTitle>
            <DialogDescription className="text-gray-300 space-y-4 pt-4">
              <p>Thank you for your contribution! Please confirm you understand these dietary definitions:</p>
              
              <div className="space-y-3 bg-background/50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🌱</span>
                  <div>
                    <p className="font-semibold text-white">Vegan</p>
                    <p className="text-sm text-gray-400">
                      Contains no animal products whatsoever - no meat, dairy, eggs, honey, or any animal-derived ingredients.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🌾</span>
                  <div>
                    <p className="font-semibold text-white">Gluten-Free</p>
                    <p className="text-sm text-gray-400">
                      Contains no wheat, barley, rye, or any gluten-containing grains. Safe for those with celiac disease or gluten sensitivity.
                    </p>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-accent-gold font-semibold">
                Please ensure your dish truly meets these criteria to keep our guests safe!
              </p>
            </DialogDescription>
          </DialogHeader>
          <button
            onClick={() => setShowConfirmDialog(false)}
            className="w-full bg-accent-red text-white px-6 py-3 rounded-lg font-semibold hover:bg-accent-red/90 transition-all glow-gold"
          >
            I Understand
          </button>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent className="bg-card border border-accent-purple/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Remove Contribution?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Are you sure you want to remove this contribution from the feast? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-accent-purple/30 text-accent-purple hover:bg-accent-purple/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => itemToDelete && handleDeleteDish(itemToDelete)}
              className="bg-accent-red hover:bg-accent-red/90 text-white"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </RequireAuth>
  );
};

export default RSVP;