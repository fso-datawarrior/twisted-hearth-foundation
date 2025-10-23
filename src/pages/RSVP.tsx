import { useState, useRef, useEffect } from "react";
import { formatEventShort, formatEventTime } from "@/lib/event";
import Footer from "@/components/Footer";
import FormField from "@/components/FormField";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import RequireAuth from "@/components/RequireAuth";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Pencil, Trash2, UtensilsCrossed, Plus, Minus, Lock, Edit, Settings, ExternalLink, Mail } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { z } from "zod";
import { trackActivity } from "@/lib/analytics-api";
import { ensureProfileExists, loadProfileDataForRSVP } from "@/lib/profile-sync";
import { Link } from "react-router-dom";

interface PotluckItem {
  id: string;
  item_name: string;
  notes: string | null;
  is_vegan: boolean;
  is_vegetarian: boolean;
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
    firstName: "",
    lastName: "",
    displayName: "",
    email: "",
    guestCount: 1,
    costumeIdea: "",
    dietary: "",
    contributions: "",
    nickname: "" // Honeypot field
  });

  // RSVP state management
  const [existingRsvp, setExistingRsvp] = useState<ExistingRsvp | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [additionalGuests, setAdditionalGuests] = useState<AdditionalGuest[]>([]);

  // Load existing RSVP and profile data on mount
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
          firstName: data.first_name || data.name?.split(' ')[0] || "",
          lastName: data.last_name || data.name?.split(' ').slice(1).join(' ') || "",
          displayName: data.display_name || "",
          email: data.email,
          guestCount: data.num_guests,
          costumeIdea: '',
          dietary: data.dietary_restrictions || '',
          contributions: '',
          nickname: ''
        });
        setIsEditing(false); // Show sealed state
      } else {
        // New user - try to load profile data first, then auto-populate email
        const profileData = await loadProfileDataForRSVP();
        
        setFormData(prev => ({ 
          ...prev, 
          firstName: profileData?.firstName || "",
          lastName: profileData?.lastName || "",
          displayName: profileData?.displayName || "",
          email: user.email || "" 
        }));
        setIsEditing(true); // Show form
      }
    };

    loadExistingRsvp();
  }, [user]);

  // Load profile data when user changes (for real-time sync)
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return;
      
      // Only load profile data if we don't have existing RSVP data
      if (!existingRsvp) {
        const profileData = await loadProfileDataForRSVP();
        if (profileData) {
          setFormData(prev => ({
            ...prev,
            firstName: profileData.firstName || prev.firstName,
            lastName: profileData.lastName || prev.lastName,
            displayName: profileData.displayName || prev.displayName,
          }));
        }
      }
    };

    loadProfileData();
  }, [user, existingRsvp]);
  
  // Load notification preferences
  useEffect(() => {
    const loadNotificationPrefs = async () => {
      if (!user) return;
      
      const { data: prefData } = await supabase
        .from('notification_preferences')
        .select('in_app_notifications, email_on_event_update')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (prefData) {
        setReceiveNotifications(prefData.email_on_event_update ?? true);
      }
    };
    
    loadNotificationPrefs();
  }, [user]);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Potluck contribution states
  const [potluckItems, setPotluckItems] = useState<PotluckItem[]>([]);
  const [dishName, setDishName] = useState("");
  const [dishNotes, setDishNotes] = useState("");
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isGlutenFree, setIsGlutenFree] = useState(false);
  const [isAddingDish, setIsAddingDish] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<PotluckItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  
  // Notification preferences
  const [receiveNotifications, setReceiveNotifications] = useState(true);
  
  // Friend invitation modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    friendName: '',
    friendEmail: '',
    personalMessage: ''
  });

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
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    
    // Email validation removed since it's locked to user's auth email
    
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
        description: "Your twisted tale reservation has been confirmed. Check your email for location details.\n🎃 Check your spam crypt if it doesn't appear!",
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
              first_name: formData.firstName.trim(),
              last_name: formData.lastName.trim(),
              display_name: formData.displayName.trim() || null,
              name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
              email: user!.email!, // Use authenticated user's email
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

            // Sync updated RSVP data to profile
            const syncResult = await ensureProfileExists({
              firstName: formData.firstName.trim(),
              lastName: formData.lastName.trim(),
              displayName: formData.displayName.trim(),
              email: user!.email!
            });

            if (!syncResult.success) {
              console.warn('Profile sync failed:', syncResult.error);
              // Don't fail the RSVP update, just log the warning
            }
          }

          // Send update notification emails
          try {
            const { data: emailData, error: emailError } = await supabase.functions.invoke("send-rsvp-confirmation", {
              body: {
                rsvpId: existingRsvp.id,
                email: formData.email,
                isUpdate: true,
              },
            });
            
            if (emailError || (emailData && typeof emailData === 'object' && 'error' in emailData)) {
              console.warn("Email delivery failed:", emailError || emailData);
              toast({
                title: "⚠️ Email Delivery Issue",
                description: "We updated your RSVP, but the confirmation email couldn't be sent. We'll retry shortly.",
                variant: "default"
              });
            }
          } catch (emailErr) {
            console.warn("Email function error:", emailErr);
            toast({
              title: "⚠️ Email Delivery Issue",
              description: "We updated your RSVP, but the confirmation email couldn't be sent. We'll retry shortly.",
              variant: "default"
            });
          }

          // Track RSVP update
          const sessionId = sessionStorage.getItem('analytics_session_id');
          if (sessionId) {
            trackActivity({
              action_type: 'rsvp_update',
              action_category: 'engagement',
              action_details: { rsvp_id: existingRsvp.id, num_guests: formData.guestCount },
              session_id: sessionId,
            }).catch(err => console.warn('Failed to track RSVP update:', err));
          }

          toast({
            title: "RSVP Updated!",
            description: "Your reservation has been updated successfully. Check your email for confirmation.\n🎃 Check your spam crypt if it doesn't appear!",
            variant: "default"
          });

          setIsEditing(false); // Return to sealed state
        } else {
          // INSERT new RSVP - Use direct INSERT for better control
          const { data, error } = await supabase
            .from('rsvps')
            .insert([{
              user_id: user!.id,
              first_name: formData.firstName.trim(),
              last_name: formData.lastName.trim(),
              display_name: formData.displayName.trim() || null,
              name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
              email: user!.email!, // Use authenticated user's email
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

            // Sync RSVP data to profile (create profile if it doesn't exist)
            const syncResult = await ensureProfileExists({
              firstName: formData.firstName.trim(),
              lastName: formData.lastName.trim(),
              displayName: formData.displayName.trim(),
              email: user!.email!
            });

            if (!syncResult.success) {
              console.warn('Profile sync failed:', syncResult.error);
              // Don't fail the RSVP submission, just log the warning
            }
          }

          // Send confirmation email
          try {
            const { data: emailData, error: emailError } = await supabase.functions.invoke("send-rsvp-confirmation", {
              body: {
                rsvpId: data.id,
                email: formData.email,
                isUpdate: false,
              },
            });
            
            if (emailError || (emailData && typeof emailData === 'object' && 'error' in emailData)) {
              console.warn("Email delivery failed:", emailError || emailData);
              toast({
                title: "⚠️ Email Delivery Issue",
                description: "We received your RSVP, but the confirmation email couldn't be sent. We'll retry shortly.",
                variant: "default"
              });
            }
          } catch (emailErr) {
            console.warn("Email function error:", emailErr);
            toast({
              title: "⚠️ Email Delivery Issue",
              description: "We received your RSVP, but the confirmation email couldn't be sent. We'll retry shortly.",
              variant: "default"
            });
          }
          
          // Sync notification preference (non-blocking)
          try {
            await supabase
              .from('notification_preferences')
              .upsert({
                user_id: user!.id,
                email_on_event_update: receiveNotifications,
                in_app_notifications: receiveNotifications,
              }, {
                onConflict: 'user_id'
              });
          } catch (err) {
            console.warn('Failed to save notification preference:', err);
          }
          
          // Track RSVP submission
          const sessionId = sessionStorage.getItem('analytics_session_id');
          if (sessionId) {
            trackActivity({
              action_type: 'rsvp_submit',
              action_category: 'engagement',
              action_details: { rsvp_id: data.id, num_guests: formData.guestCount },
              session_id: sessionId,
            }).catch(err => console.warn('Failed to track RSVP submission:', err));
          }

          toast({
            title: "RSVP Received!",
            description: "Your twisted tale reservation has been confirmed. Check your email for location details.\n🎃 Check your spam crypt if it doesn't appear!",
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
        firstName: existingRsvp.name?.split(' ')[0] || "",
        lastName: existingRsvp.name?.split(' ').slice(1).join(' ') || "",
        displayName: "",
        email: existingRsvp.email,
        guestCount: existingRsvp.num_guests,
        costumeIdea: '',
        dietary: existingRsvp.dietary_restrictions || '',
        contributions: '',
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

  const handleDeclineRsvp = async () => {
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      
      if (existingRsvp) {
        // Update existing RSVP to declined
        const { error } = await supabase
          .from('rsvps')
          .update({
            status: 'declined',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        // Reload RSVP data
        const { data } = await supabase
          .from('rsvps')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
          
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
      } else {
        // Create new declined RSVP
        const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();
        const { data, error } = await supabase
          .from('rsvps')
          .insert({
            user_id: user.id,
            name: fullName,
            first_name: formData.firstName.trim(),
            last_name: formData.lastName.trim(),
            display_name: formData.displayName.trim() || null,
            email: user.email!,
            num_guests: 0,
            status: 'declined',
          })
          .select()
          .single();
          
        if (error) throw error;
        
        if (data) {
          setExistingRsvp({
            id: data.id,
            name: data.name,
            email: data.email,
            num_guests: data.num_guests,
            dietary_restrictions: data.dietary_restrictions,
            additional_guests: null,
            created_at: data.created_at,
            updated_at: data.updated_at,
            status: data.status,
          });
        }
      }
      
      toast({
        title: "RSVP Updated",
        description: "We're sorry you can't make it. You can change your mind anytime!",
      });
    } catch (error) {
      console.error('Decline error:', error);
      toast({
        title: "Error",
        description: "Could not update RSVP. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendInvite = async () => {
    if (!inviteForm.friendName.trim() || !inviteForm.friendEmail.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide your friend's name and email.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase.functions.invoke('send-friend-invitation', {
        body: {
          inviterName: existingRsvp?.name || user?.email,
          friendName: inviteForm.friendName.trim(),
          friendEmail: inviteForm.friendEmail.trim(),
          personalMessage: inviteForm.personalMessage.trim() || undefined,
          eventUrl: window.location.origin
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Invitation Sent! 🎃",
        description: `Your friend ${inviteForm.friendName} will receive an invitation email shortly.`,
      });
      
      setShowInviteModal(false);
      setInviteForm({ friendName: '', friendEmail: '', personalMessage: '' });
    } catch (error) {
      console.error('Invite error:', error);
      toast({
        title: "Failed to Send",
        description: "Could not send invitation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
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
            is_vegetarian: isVegetarian,
            is_gluten_free: isGlutenFree,
          })
          .eq('id', editingItem.id);

        if (error) throw error;

        setPotluckItems(prev => prev.map(item => 
          item.id === editingItem.id 
            ? { ...item, item_name: dishName, notes: dishNotes || null, is_vegetarian: isVegetarian, is_vegan: isVegetarian, is_gluten_free: isGlutenFree }
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
            is_vegetarian: isVegetarian,
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
              isVegetarian,
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

        if (isVegetarian || isGlutenFree) {
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
      setIsVegetarian(false);
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
    setIsVegetarian(item.is_vegetarian || item.is_vegan);
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
    setIsVegetarian(false);
    setIsGlutenFree(false);
  };

  return (
    <RequireAuth>
      <div className="min-h-screen bg-background relative">
        <main className="pt-28 sm:pt-32 md:pt-36 relative z-10">
          <section className="py-16 px-0.5 sm:px-4 md:px-6">
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

                {existingRsvp.status === 'declined' && (
                  <div className="mb-6 p-4 bg-accent-red/10 border border-accent-red/30 rounded-lg">
                    <p className="text-center text-accent-red font-subhead text-lg">
                      You've indicated you cannot attend this event.
                    </p>
                    <p className="text-center text-muted-foreground text-sm mt-2">
                      Changed your mind? Click "Modify Your Fate" below to update your RSVP.
                    </p>
                  </div>
                )}

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

                <div className="mt-8">
                  <Button
                    type="button"
                    onClick={handleEditRsvp}
                    className="w-full bg-accent-purple hover:bg-accent-purple/80 text-white font-subhead text-lg py-4 glow-gold motion-safe hover:scale-105 transition-transform"
                  >
                    <Edit className="h-5 w-5 mr-2" />
                    Modify Your Fate
                  </Button>
                  
                  <p className="font-body text-xs text-muted-foreground mt-4 text-center">
                    Need to update your guest count or dietary restrictions? Click above to make changes.
                  </p>
                  
                  {existingRsvp.status !== 'declined' && (
                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleDeclineRsvp}
                        disabled={isSubmitting}
                        className="flex-1 border-accent-red/30 text-accent-red hover:bg-accent-red/10 font-subhead text-sm px-8 py-3"
                      >
                        Can't Attend
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowInviteModal(true)}
                        className="flex-1 border-accent-gold/30 text-accent-gold hover:bg-accent-gold/10 font-subhead text-sm px-8 py-3"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Invite a Friend
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-card p-8 rounded-lg border border-accent-purple/30 shadow-lg">
                <form onSubmit={handleSubmit} className="space-y-6">
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
                    label="First Name *"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(value) => handleInputChange("firstName", value)}
                    error={errors.firstName}
                    placeholder="Your first name"
                    autoComplete="given-name"
                    enterKeyHint="next"
                  />
                  
                  <FormField
                    label="Last Name *"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(value) => handleInputChange("lastName", value)}
                    error={errors.lastName}
                    placeholder="Your last name"
                    autoComplete="family-name"
                    enterKeyHint="next"
                  />
                </div>
                
                <div className="space-y-2">
                  <FormField
                    label="Display Name (Optional)"
                    name="displayName"
                    type="text"
                    value={formData.displayName}
                    onChange={(value) => handleInputChange("displayName", value)}
                    placeholder="How you want to appear on the site"
                    autoComplete="off"
                    enterKeyHint="next"
                  />
                  <p className="text-xs text-muted-foreground ml-1">
                    This is what other users will see. If left blank, we'll use your first name.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email-display">Email Address *</Label>
                  <div className="relative">
                    <div className="flex items-center gap-2 p-3 rounded-md border border-input bg-muted/50 text-sm text-muted-foreground">
                      <Lock className="h-4 w-4 flex-shrink-0" />
                      <span className="flex-1">{user?.email}</span>
                    </div>
                    <div className="mt-2 p-3 rounded-md bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-2 text-sm">
                        <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-blue-800 dark:text-blue-200 font-medium">
                            Need to change your email?
                          </p>
                          <p className="text-blue-700 dark:text-blue-300 mt-1">
                            Visit your{" "}
                            <Link 
                              to="/settings" 
                              className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium underline underline-offset-2"
                            >
                              Settings
                              <ExternalLink className="h-3 w-3" />
                            </Link>{" "}
                            to update your email address.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
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
                              autoComplete="name"
                              enterKeyHint="next"
                            />
                            
                            <FormField
                              label={`Guest ${index + 2} Email`}
                              name={`guest-${index}-email`}
                              type="email"
                              value={guest.email}
                              onChange={(value) => handleAdditionalGuestChange(index, 'email', value)}
                              error={errors[`guest-${index}-email`]}
                              placeholder="guest@example.com (optional)"
                              inputMode="email"
                              autoComplete="email"
                              enterKeyHint="next"
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
                      autoComplete="off"
                      enterKeyHint="next"
                    />
                    
                    <FormField
                      label="Dietary Restrictions"
                      name="dietary"
                      type="textarea" 
                      value={formData.dietary}
                      onChange={(value) => handleInputChange("dietary", value)}
                      placeholder="Any allergies, dietary preferences, or foods that might poison you?"
                      rows={2}
                      autoComplete="off"
                      enterKeyHint="done"
                    />
                    
                    {/* Notification Preferences */}
                    <div className="space-y-2 pt-2">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="notifications"
                          checked={receiveNotifications}
                          onCheckedChange={(checked) => setReceiveNotifications(checked as boolean)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <label htmlFor="notifications" className="text-sm text-gray-300 cursor-pointer block">
                            📧 Send me email updates about event changes and announcements
                          </label>
                          <p className="text-xs text-muted-foreground mt-1">
                            You can manage your notification preferences in{" "}
                            <Link 
                              to="/settings" 
                              className="text-accent-gold hover:text-accent-gold/80 underline"
                            >
                              Settings
                            </Link>
                          </p>
                        </div>
                      </div>
                    </div>
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
                      id="vegetarian"
                      checked={isVegetarian}
                      onCheckedChange={(checked) => setIsVegetarian(checked as boolean)}
                      className="dietary-checkbox"
                    />
                    <label htmlFor="vegetarian" className="text-sm text-gray-300 cursor-pointer">
                      🥕 This dish is Vegetarian
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
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-white flex items-center gap-2 flex-wrap">
                                {item.item_name}
                                <div className="flex gap-1">
                                  {(item.is_vegetarian || item.is_vegan) && <span title="Vegetarian">🥕</span>}
                                  {item.is_gluten_free && <span title="Gluten-Free">🌾</span>}
                                </div>
                              </h3>
                              {item.notes && <p className="text-sm text-gray-400 mt-1">{item.notes}</p>}
                              <p className="text-xs text-gray-500 mt-1">
                                Added {new Date(item.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2 sm:ml-4">
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
                  <span className="text-2xl">🥕</span>
                  <div>
                    <p className="font-semibold text-white">Vegetarian</p>
                    <p className="text-sm text-gray-400">
                      Contains no meat, poultry, fish, or seafood. May contain dairy and eggs.
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

      {/* Friend Invitation Modal */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent className="bg-card border border-accent-purple/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white font-heading text-2xl">Invite a Friend</DialogTitle>
            <DialogDescription className="text-gray-300">
              Share the twisted tale with someone you'd like to join the festivities!
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="friendName" className="text-accent-gold">Friend's Name *</Label>
              <Input
                id="friendName"
                value={inviteForm.friendName}
                onChange={(e) => setInviteForm(prev => ({ ...prev, friendName: e.target.value }))}
                placeholder="Enter your friend's name"
                className="mt-1 bg-background border-input text-white"
              />
            </div>
            
            <div>
              <Label htmlFor="friendEmail" className="text-accent-gold">Friend's Email *</Label>
              <Input
                id="friendEmail"
                type="email"
                value={inviteForm.friendEmail}
                onChange={(e) => setInviteForm(prev => ({ ...prev, friendEmail: e.target.value }))}
                placeholder="friend@example.com"
                className="mt-1 bg-background border-input text-white"
              />
            </div>
            
            <div>
              <Label htmlFor="personalMessage" className="text-accent-gold">Personal Message (Optional)</Label>
              <Textarea
                id="personalMessage"
                value={inviteForm.personalMessage}
                onChange={(e) => setInviteForm(prev => ({ ...prev, personalMessage: e.target.value }))}
                placeholder="Add a personal note to your invitation..."
                maxLength={280}
                rows={3}
                className="mt-1 bg-background border-input text-white resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">{inviteForm.personalMessage.length}/280 characters</p>
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowInviteModal(false);
                setInviteForm({ friendName: '', friendEmail: '', personalMessage: '' });
              }}
              className="flex-1 border-accent-purple/30 text-accent-purple hover:bg-accent-purple/10"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSendInvite}
              disabled={isSubmitting || !inviteForm.friendName.trim() || !inviteForm.friendEmail.trim()}
              className="flex-1 bg-accent-gold hover:bg-accent-gold/80 text-ink font-subhead"
            >
              {isSubmitting ? "Sending..." : "Send Invitation"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </RequireAuth>
  );
};

export default RSVP;