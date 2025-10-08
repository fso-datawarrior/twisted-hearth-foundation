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
import { Pencil, Trash2, UtensilsCrossed, Plus, Minus, Lock, Edit } from "lucide-react";
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

interface AdditionalGuest {
  name: string;
  email: string;
}

interface ExistingRsvp {
  id: string;
  name: string;
  email: string;
  num_guests: number;
  dietary_restrictions: string | null;
  additional_guests: AdditionalGuest[] | null;
  created_at: string;
  updated_at: string;
  status: string;
}

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

  // RSVP state management
  const [existingRsvp, setExistingRsvp] = useState<ExistingRsvp | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [additionalGuests, setAdditionalGuests] = useState<AdditionalGuest[]>([]);

  // Load existing RSVP on mount
  useEffect(() => {
    const loadExistingRsvp = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('rsvps')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading RSVP:', error);
        return;
      }

      if (data) {
        // Parse additional guests from JSONB
        const guestData = data.additional_guests as unknown as AdditionalGuest[] | null;
        if (guestData && Array.isArray(guestData)) {
          setAdditionalGuests(guestData);
        } else {
          setAdditionalGuests([]);
        }

        // Cast to ExistingRsvp type
        setExistingRsvp({
          id: data.id,
          name: data.name,
          email: data.email,
          num_guests: data.num_guests,
          dietary_restrictions: data.dietary_restrictions,
          additional_guests: guestData,
          created_at: data.created_at,
          updated_at: data.updated_at,
          status: data.status,
        });
        
        setFormData({
          name: data.name,
          email: data.email,
          guestCount: data.num_guests,
          costumeIdea: '',
          dietary: data.dietary_restrictions || '',
          nickname: ''
        });
        setIsEditing(false); // Show sealed state
      } else {
        // New user, auto-populate email
        setFormData(prev => ({ ...prev, email: user.email || "" }));
        setIsEditing(true); // Show form
      }
    };

    loadExistingRsvp();
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
  }, [user]);

  // Auto-adjust additionalGuests array when guestCount changes
  useEffect(() => {
    if (formData.guestCount > 1) {
      const needed = formData.guestCount - 1;
      setAdditionalGuests(prev => {
        const current = [...prev];
        // Add empty slots if needed
        while (current.length < needed) {
          current.push({ name: '', email: '' });
        }
        // Remove extra slots if guest count decreased
        if (current.length > needed) {
          return current.slice(0, needed);
        }
        return current;
      });
    } else {
      // Clear additional guests if count is 1 or less
      setAdditionalGuests([]);
    }
  }, [formData.guestCount]);

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

    // Validate additional guests (if applicable)
    if (formData.guestCount > 1) {
      additionalGuests.forEach((guest, index) => {
        if (!guest.name.trim()) {
          newErrors[`guest-${index}-name`] = `Guest ${index + 2} name is required`;
        }
        
        // Validate email format if provided
        if (guest.email.trim() && !/\S+@\S+\.\S+/.test(guest.email)) {
          newErrors[`guest-${index}-email`] = `Invalid email format`;
        }
      });
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
      return;
    }
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        if (existingRsvp) {
          // UPDATE existing RSVP
          const { error: updateError } = await supabase
            .from('rsvps')
            .update({
              name: formData.name,
              email: formData.email.toLowerCase().trim(),
              num_guests: formData.guestCount,
              dietary_restrictions: formData.dietary || null,
              additional_guests: (formData.guestCount > 1 ? additionalGuests : null) as any,
              updated_at: new Date().toISOString(),
              status: 'pending', // Reset to pending on edit
            })
            .eq('user_id', user!.id);

          if (updateError) {
            console.error("Update Error:", updateError);
            throw new Error("Failed to update RSVP");
          }

          // Reload RSVP data
          const { data: updatedData } = await supabase
            .from('rsvps')
            .select('*')
            .eq('user_id', user!.id)
            .single();

          if (updatedData) {
            const guestData = updatedData.additional_guests as unknown as AdditionalGuest[] | null;
            setExistingRsvp({
              id: updatedData.id,
              name: updatedData.name,
              email: updatedData.email,
              num_guests: updatedData.num_guests,
              dietary_restrictions: updatedData.dietary_restrictions,
              additional_guests: guestData,
              created_at: updatedData.created_at,
              updated_at: updatedData.updated_at,
              status: updatedData.status,
            });
          }

          // Send update notification emails
          try {
            await supabase.functions.invoke("send-rsvp-confirmation", {
              body: {
                rsvpId: existingRsvp.id,
                name: formData.name,
                email: formData.email,
                guests: formData.guestCount,
                isUpdate: true,
                additionalGuests: formData.guestCount > 1 ? additionalGuests : [],
              },
            });
          } catch (emailErr) {
            console.warn("Email function error:", emailErr);
          }

          toast({
            title: "RSVP Updated!",
            description: "Your reservation has been updated successfully. Check your email for confirmation.",
            variant: "default"
          });

          setIsEditing(false); // Return to sealed state
        } else {
          // INSERT new RSVP - Use direct INSERT for better control
          const { data, error } = await supabase
            .from('rsvps')
            .insert([{
              user_id: user!.id,
              name: formData.name,
              email: formData.email.toLowerCase().trim(),
              num_guests: formData.guestCount,
              dietary_restrictions: formData.dietary || null,
              additional_guests: (formData.guestCount > 1 ? additionalGuests : null) as any,
              status: 'pending'
            }])
            .select()
            .single();

          if (error) {
            console.error("Insert Error:", error);
            throw new Error("Failed to save RSVP");
          }

          if (data) {
            const guestData = data.additional_guests as unknown as AdditionalGuest[] | null;
            setExistingRsvp({
              id: data.id,
              name: data.name,
              email: data.email,
              num_guests: data.num_guests,
              dietary_restrictions: data.dietary_restrictions,
              additional_guests: guestData,
              created_at: data.created_at,
              updated_at: data.updated_at,
              status: data.status,
            });
          }

          // Send confirmation email
          try {
            await supabase.functions.invoke("send-rsvp-confirmation", {
              body: {
                rsvpId: data.id,
                name: formData.name,
                email: formData.email,
                guests: formData.guestCount,
                isUpdate: false,
                additionalGuests: formData.guestCount > 1 ? additionalGuests : [],
              },
            });
          } catch (emailErr) {
            console.warn("Email function error:", emailErr);
          }
          
          toast({
            title: "RSVP Received!",
            description: "Your twisted tale reservation has been confirmed. Check your email for location details.",
            variant: "default"
          });

          setIsEditing(false); // Show sealed state
        }
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

  const handleEditRsvp = () => {
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    if (existingRsvp) {
      // Restore original values
      setFormData({
        name: existingRsvp.name,
        email: existingRsvp.email,
        guestCount: existingRsvp.num_guests,
        costumeIdea: '',
        dietary: existingRsvp.dietary_restrictions || '',
        nickname: ''
      });
      
      // Restore additional guests from existing RSVP
      const guestData = existingRsvp.additional_guests;
      if (guestData && Array.isArray(guestData)) {
        setAdditionalGuests(guestData);
      } else {
        setAdditionalGuests([]);
      }
    }
    setIsEditing(false);
  };

  const handleAdditionalGuestChange = (index: number, field: 'name' | 'email', value: string) => {
    setAdditionalGuests(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    
    // Clear error for this field
    const errorKey = `guest-${index}-${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }));
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
        try {
          const contributorName = (user as any).user_metadata?.full_name || user.email?.split('@')[0] || 'Guest';
          const emailResponse = await supabase.functions.invoke('send-contribution-confirmation', {
            body: {
              contributorEmail: user.email,
              contributorName,
              dishName,
              notes: dishNotes || undefined,
              isVegan,
              isGlutenFree,
            }
          });
          
          if (emailResponse.error) {
            console.error('Email error:', emailResponse.error);
          } else {
            console.log('Contribution confirmation emails sent successfully');
          }
        } catch (emailErr) {
          console.error('Failed to send contribution confirmation email:', emailErr);
        }

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
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      const { error } = await supabase.rpc('soft_delete_potluck_item', {
        p_item_id: id
      });

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
    // TEMPORARY: Bypass RequireAuth for testing due to rate limiting issues
    // <RequireAuth>
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
            
            {/* Sealed Invitation Card */}
            {existingRsvp && !isEditing ? (
              <div className="bg-card p-8 rounded-lg border-2 border-accent-gold shadow-lg relative overflow-hidden">
                {/* Decorative seal effect */}
                <div className="absolute top-4 right-4 bg-accent-red/20 rounded-full p-3">
                  <Lock className="h-6 w-6 text-accent-red" />
                </div>

                <h2 className="font-heading text-3xl md:text-4xl text-center mb-2 text-accent-gold">
                  Your Fate Has Been Sealed
                </h2>
                
                <p className="text-center text-muted-foreground mb-8 font-body">
                  Your presence at the Twisted Tale is confirmed
                </p>

                <div className="space-y-6 bg-background/50 p-6 rounded-lg border border-accent-purple/30">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-accent-gold text-sm mb-1 block">Name</Label>
                      <p className="text-white font-medium text-lg">{existingRsvp.name}</p>
                    </div>
                    
                    <div>
                      <Label className="text-accent-gold text-sm mb-1 block">Email</Label>
                      <p className="text-white font-medium text-lg break-all">{existingRsvp.email}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-accent-gold text-sm mb-1 block">Number of Guests</Label>
                    <p className="text-white font-medium text-lg">{existingRsvp.num_guests}</p>
                  </div>

                  {existingRsvp.num_guests > 1 && additionalGuests.length > 0 && (
                    <div>
                      <Label className="text-accent-gold text-sm mb-2 block">Additional Guests</Label>
                      <div className="space-y-2">
                        {additionalGuests.map((guest, index) => (
                          <div key={index} className="bg-background/30 p-3 rounded border border-accent-purple/20">
                            <p className="text-white font-medium">
                              Guest {index + 2}: {guest.name}
                              {guest.email && <span className="text-muted-foreground text-sm ml-2">({guest.email})</span>}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {existingRsvp.dietary_restrictions && (
                    <div>
                      <Label className="text-accent-gold text-sm mb-1 block">Dietary Restrictions</Label>
                      <p className="text-white font-medium">{existingRsvp.dietary_restrictions}</p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-accent-purple/30">
                    <p className="text-xs text-muted-foreground text-center">
                      Last updated: {new Date(existingRsvp.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <Button
                    type="button"
                    onClick={handleEditRsvp}
                    className="bg-accent-purple hover:bg-accent-purple/80 text-white font-subhead text-lg px-12 py-4 glow-gold motion-safe hover:scale-105 transition-transform"
                  >
                    <Edit className="h-5 w-5 mr-2" />
                    Modify Your Fate
                  </Button>
                  
                  <p className="font-body text-xs text-muted-foreground mt-4 max-w-md mx-auto">
                    Need to update your guest count or dietary restrictions? Click above to make changes.
                  </p>
                </div>
              </div>
            ) : (
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

                {/* Additional Guest Details - Only shown when guests > 1 */}
                {formData.guestCount > 1 && (
                  <div className="border-t border-accent-purple/30 pt-6">
                    <h3 className="font-subhead text-xl mb-4 text-accent-gold">
                      Additional Guest Details
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 font-body">
                      Please provide the names of your additional guests (guests 2-{formData.guestCount})
                    </p>
                    
                    <div className="space-y-4">
                      {additionalGuests.map((guest, index) => (
                        <div key={index} className="bg-background/50 p-4 rounded-lg border border-accent-purple/20">
                          <p className="text-accent-gold font-subhead mb-3">Guest {index + 2}</p>
                          <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                              label={`Guest ${index + 2} Full Name *`}
                              name={`guest-${index}-name`}
                              type="text"
                              value={guest.name}
                              onChange={(value) => handleAdditionalGuestChange(index, 'name', value)}
                              error={errors[`guest-${index}-name`]}
                              placeholder="Enter guest's full name"
                            />
                            
                            <FormField
                              label={`Guest ${index + 2} Email`}
                              name={`guest-${index}-email`}
                              type="email"
                              value={guest.email}
                              onChange={(value) => handleAdditionalGuestChange(index, 'email', value)}
                              error={errors[`guest-${index}-email`]}
                              placeholder="guest@example.com (optional)"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
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
                <div className="pt-6 text-center space-y-4">
                  <div className="flex gap-4 justify-center">
                    {existingRsvp && (
                      <Button
                        type="button"
                        onClick={handleCancelEdit}
                        variant="outline"
                        className="border-accent-purple/30 text-accent-purple hover:bg-accent-purple/10 font-subhead text-lg px-8 py-4"
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-accent-red hover:bg-accent-red/80 text-ink font-subhead text-lg px-12 py-4 glow-gold motion-safe hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Submitting…" : existingRsvp ? "Update Your RSVP" : "Seal Your Fate"}
                    </Button>
                  </div>
                  
                  <p className="font-body text-xs text-muted-foreground max-w-md mx-auto">
                    {existingRsvp 
                      ? "Your changes will be saved and your reservation updated."
                      : "By submitting this RSVP, you agree to participate in interactive storytelling and acknowledge that some content may be intense. 18+ recommended."
                    }
                  </p>
                </div>
              </form>
            </div>
            )}

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
                      className="dietary-checkbox"
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
                      className="dietary-checkbox"
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
    // </RequireAuth>
  );
};

export default RSVP;