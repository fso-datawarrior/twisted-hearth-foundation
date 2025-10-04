import { useState, useEffect } from "react";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import HuntRune from "@/components/hunt/HuntRune";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

interface PotluckItem {
  id: string;
  item_name: string;
  notes?: string;
  is_vegan?: boolean;
  is_gluten_free?: boolean;
  created_at: string;
  contributor_name?: string;
  user_email?: string;
}

const potluckItemSchema = z.object({
  item_name: z.string().min(1, "Dish name is required").max(80, "Dish name must be less than 80 characters"),
  notes: z.string().max(140, "Notes must be less than 140 characters").optional(),
});

const Feast = () => {
  const [potluckItems, setPotluckItems] = useState<PotluckItem[]>([]);
  const [itemName, setItemName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [notes, setNotes] = useState("");
  const [isVegan, setIsVegan] = useState(false);
  const [isGlutenFree, setIsGlutenFree] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Auto-populate display name from RSVP or email when user logs in
  useEffect(() => {
    const loadDisplayName = async () => {
      if (!user?.email) return;
      
      // Try to get name from RSVP
      const { data: rsvpData } = await supabase
        .from('rsvps')
        .select('name')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (rsvpData?.name) {
        setDisplayName(rsvpData.name);
      } else {
        // Fallback: format email username
        const emailUsername = user.email.split('@')[0];
        const formattedName = emailUsername.replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        setDisplayName(formattedName);
      }
    };
    
    loadDisplayName();
  }, [user]);

  // Load potluck items with contributor names
  useEffect(() => {
    const loadPotluckItems = async () => {
      // Fetch potluck items
      const { data: items, error: itemsError } = await supabase
        .from('potluck_items')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (itemsError) {
        console.error("Error loading potluck items:", itemsError);
        return;
      }
      
      if (!items || items.length === 0) {
        setPotluckItems([]);
        return;
      }
      
      // Map items to include display_name (stored) or fallback to email username
      const itemsWithNames = items.map((item: any) => {
        let contributorName = item.display_name;
        
        // Fallback: extract name from email if no display name
        if (!contributorName && item.user_email) {
          const emailUsername = item.user_email.split('@')[0];
          contributorName = emailUsername.replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
        
        return {
          id: item.id,
          item_name: item.item_name,
          notes: item.notes,
          is_vegan: item.is_vegan,
          is_gluten_free: item.is_gluten_free,
          created_at: item.created_at,
          user_email: item.user_email,
          contributor_name: contributorName
        };
      });
      
      setPotluckItems(itemsWithNames);
    };
    
    loadPotluckItems();
  }, []);

  const handleSubmitItem = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate input
    try {
      potluckItemSchema.parse({ item_name: itemName.trim(), notes: notes.trim() || undefined });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: error.errors[0].message,
        });
        return;
      }
    }

    if (!user?.email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to add a contribution",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Insert into database
      const { data, error } = await supabase
        .from("potluck_items")
        .insert([
          {
            user_id: user.id,
            item_name: itemName.trim(),
            notes: notes.trim() || null,
            is_vegan: isVegan,
            is_gluten_free: isGlutenFree,
            user_email: user.email,
            display_name: displayName.trim(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      
      setPotluckItems([{ ...data, contributor_name: displayName.trim() }, ...potluckItems]);

      // Send confirmation emails
      try {
        const { error: emailError } = await supabase.functions.invoke('send-contribution-confirmation', {
          body: {
            contributorEmail: user.email,
            contributorName: displayName.trim(),
            dishName: itemName.trim(),
            notes: notes.trim() || undefined,
            isVegan,
            isGlutenFree,
          },
        });

        if (emailError) {
          console.error('Email error:', emailError);
          // Don't block the user if email fails
        }
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
      }

      // Reset form
      setItemName("");
      setNotes("");
      setIsVegan(false);
      setIsGlutenFree(false);

      // Show confirmation dialog if dietary restrictions were selected
      if (isVegan || isGlutenFree) {
        setShowConfirmDialog(true);
      } else {
        toast({
          title: "Success!",
          description: "Your dish has been added to the feast",
        });
      }
    } catch (error: any) {
      console.error("Error adding item:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add item",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const signatureDrinks = [
    {
      name: "Poison Apple Martini",
      description: "Green apple vodka, sour apple schnapps, and a hint of cinnamon. Garnished with a red wax seal. <em>Warning: One sip and you'll never want to wake up from this dream.</em>",
      ingredients: "Vodka, Apple Schnapps, Lime, Simple Syrup, Cinnamon"
    },
    {
      name: "Blood Wine of the Beast", 
      description: "Deep red wine blend with blackberry and pomegranate. Served in goblets with dry ice. <em>The Beast's curse runs deep - each sip brings you closer to the transformation.</em>",
      ingredients: "Cabernet, Blackberry Liqueur, Pomegranate Juice, Dry Ice"
    },
    {
      name: "Sleeping Beauty's Nightcap",
      description: "Lavender-infused gin with butterfly pea flower tea. Changes color when citrus is added. <em>Sleep comes easily, but waking up... that's another story entirely.</em>",
      ingredients: "Gin, Lavender, Butterfly Pea Tea, Lemon, Elderflower"
    },
    {
      name: "Rumpelstiltskin's Gold",
      description: "Bourbon cocktail with honey and gold leaf. The price of magic in liquid form. <em>Every drop costs more than you think - are you willing to pay the price?</em>",
      ingredients: "Bourbon, Honey Syrup, Lemon, Gold Leaf, Angostura Bitters"
    },
    {
      name: "Alice's Mad Tea Party",
      description: "Earl Grey-infused vodka with chamomile and a splash of absinthe. <em>Down the rabbit hole you go - there's no turning back once you've tasted madness.</em>",
      ingredients: "Vodka, Earl Grey Tea, Chamomile, Absinthe, Simple Syrup"
    },
    {
      name: "Cheshire Cat's Grin",
      description: "Smoky mezcal with lime and a mysterious disappearing garnish. <em>The smile remains long after the drink is gone - just like the cat.</em>",
      ingredients: "Mezcal, Lime, Agave, Smoked Salt, Mystery Garnish"
    }
  ];

  const potluckSuggestions = [
    {
      category: "Appetizers",
      items: [
        "Hansel & Gretel Gingerbread Bruschetta",
        "Three Little Pigs Bacon-Wrapped Scallops", 
        "Rapunzel's Twisted Hair Breadsticks",
        "Alice's 'Eat Me' Mushroom Caps"
      ]
    },
    {
      category: "Main Dishes",
      items: [
        "Big Bad Wolf's Grandmother Stew",
        "Goldilocks' Perfectly Seasoned Bear Roast",
        "Jack's Giant-Slaying Beef Wellington",
        "Cinderella's Midnight Pumpkin Risotto"
      ]
    },
    {
      category: "Desserts", 
      items: [
        "Queen of Hearts' Tart Execution",
        "Witch's Oven Gingerbread House Cake",
        "Snow White's Poisoned Apple Pie",
        "Sleeping Beauty's 100-Year Aged Cheese"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background relative">
      <main className="pt-20 relative z-10">
        {/* <CSSFogBackground /> */}
        <section className="py-16 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="relative">
              <HuntRune 
                id="11" 
                label="Flavor sharp as a blade"
                className="absolute top-0 right-4"
              />
              <h1 className="font-heading text-4xl md:text-6xl text-center mb-8 text-shadow-gothic">
                Feast of Dark Delights
              </h1>
            </div>
            
            <p className="font-body text-lg text-center mb-12 text-muted-foreground max-w-3xl mx-auto">
              A twisted potluck where every dish tells a story. Bring something inspired by your 
              favorite (or most feared) fairytale, and we'll provide the libations to wash down 
              the darkness.
            </p>
            
            {/* Signature Cocktails */}
            <div className="mb-16">
              <h2 className="font-subhead text-3xl text-center mb-8 text-accent-gold">
                Signature Libations
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {signatureDrinks.map((drink, index) => (
                  <div 
                    key={index}
                    className="bg-card p-6 rounded-lg border border-accent-purple/30 hover:border-accent-gold/50 transition-colors motion-safe relative"
                  >
                    {index === 0 && (
                      <HuntRune 
                        id="12" 
                        label="A diced confession"
                        className="absolute top-2 right-2"
                      />
                    )}
                    <h3 className="font-subhead text-xl mb-3 text-accent-red">
                      {drink.name}
                    </h3>
                    <p className="font-body text-muted-foreground mb-4" dangerouslySetInnerHTML={{ __html: drink.description }}>
                    </p>
                    <div className="text-sm">
                      <span className="font-subhead text-accent-gold">Ingredients: </span>
                      <span className="font-body text-muted-foreground">{drink.ingredients}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 text-center">
                <div className="bg-bg-2 p-6 rounded-lg border border-accent-purple/30 max-w-2xl mx-auto">
                  <p className="font-body text-muted-foreground mb-4">
                    <strong className="text-accent-red">Note:</strong> All cocktails are crafted by our 
                    resident potion master. Non-alcoholic "virgin potions" available upon request. 
                    Please drink responsibly - we can't guarantee what these brews might reveal 
                    about your true nature.
                  </p>
                  <div className="mt-4 p-4 bg-accent-red/10 border border-accent-red/30 rounded-lg">
                    <p className="font-body text-accent-red font-semibold mb-2">
                      🚗 Don't Drink & Drive - Use Rideshare!
                    </p>
                    <p className="font-body text-sm text-muted-foreground">
                      Uber, Lyft, and other rideshare services are strongly encouraged. 
                      The madness of Wonderland is best experienced when you can fully indulge 
                      in our twisted libations without worry.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Potluck Contributions Panel */}
            <div className="mb-16 relative">
              <HuntRune 
                id="13" 
                label="What's shared tastes sweeter"
                bonus={true}
                className="absolute -top-2 -right-2 z-10"
              />
              <h2 className="font-subhead text-3xl text-center mb-8 text-accent-gold">
                Potluck Contributions
              </h2>
              <p className="font-body text-center mb-8 text-muted-foreground max-w-2xl mx-auto">
                Bring a dish for the banquet table—beware the knives. See what others are contributing 
                and add your own twisted creation to the feast.
              </p>
              
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Contribution Form */}
                <div className="bg-card p-6 rounded-lg border border-accent-purple/30">
                  <h3 className="font-subhead text-xl mb-4 text-accent-gold">Add Your Contribution</h3>
                  
                  {user ? (
                    <form onSubmit={handleSubmitItem} className="space-y-4">
                      <div>
                        <Label htmlFor="item_name" className="font-subhead text-accent-gold">
                          Dish Name
                        </Label>
                        <Input
                          id="item_name"
                          value={itemName}
                          onChange={(e) => setItemName(e.target.value)}
                          placeholder="e.g., Grandmother's Secret Stew"
                          maxLength={80}
                          required
                          disabled={isLoading}
                          className="bg-background border-accent-purple/30 focus:border-accent-gold"
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                          {itemName.length}/80 characters
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="displayName" className="font-subhead text-accent-gold">
                          Name to Display on Your Contribution
                        </Label>
                        <Input
                          id="displayName"
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="e.g., Chef Alice"
                          required
                          disabled={isLoading}
                          className="bg-background border-accent-purple/30 focus:border-accent-gold"
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                          This name will appear on your contribution card
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="notes" className="font-subhead text-accent-gold">
                          Notes (Optional)
                        </Label>
                        <Textarea
                          id="notes"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Any special ingredients, dietary info, or dark secrets..."
                          maxLength={140}
                          rows={3}
                          disabled={isLoading}
                          className="bg-background border-accent-purple/30 focus:border-accent-gold"
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                          {notes.length}/140 characters
                        </div>
                      </div>

                      {/* Dietary Restrictions */}
                      <div className="space-y-3">
                        <Label className="font-subhead text-accent-gold">Dietary Information</Label>
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="vegan"
                              checked={isVegan}
                              onCheckedChange={(checked) => setIsVegan(checked as boolean)}
                              disabled={isLoading}
                            />
                            <Label htmlFor="vegan" className="text-sm cursor-pointer font-body text-muted-foreground">
                              🌱 This dish is <strong>Vegan</strong>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="gluten-free"
                              checked={isGlutenFree}
                              onCheckedChange={(checked) => setIsGlutenFree(checked as boolean)}
                              disabled={isLoading}
                            />
                            <Label htmlFor="gluten-free" className="text-sm cursor-pointer font-body text-muted-foreground">
                              🌾 This dish is <strong>Gluten-Free</strong>
                            </Label>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        type="submit"
                        disabled={isLoading || !itemName.trim()}
                        className="w-full bg-accent-gold hover:bg-accent-gold/80 text-background font-subhead"
                      >
                        {isLoading ? "Adding..." : "Add to Feast"}
                      </Button>
                    </form>
                  ) : (
                    <div className="text-center py-8">
                      <p className="font-body text-muted-foreground mb-4">
                        Sign in to add what you'll bring to the feast
                      </p>
                      <p className="font-body text-sm text-muted-foreground">
                        Use the Magic Mirror navigation (top-right) to sign in
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Current Contributions List */}
                <div className="bg-card p-6 rounded-lg border border-accent-purple/30">
                  <h3 className="font-subhead text-xl mb-4 text-accent-gold">Current Contributions</h3>
                  
                  {potluckItems.length === 0 ? (
                    <p className="text-muted-foreground py-8 text-center">No contributions yet. Be the first to add a dish!</p>
                  ) : (
                    <>
                      <div className="scroll-area-enhanced" data-scrollable={potluckItems.length > 4 ? "true" : "false"}>
                        <ScrollArea className="max-h-96 pr-4">
                          <div className="space-y-3">
                            {potluckItems.map((item) => (
                              <Card key={item.id} className="border-2 border-accent-gold bg-background/50">
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-white flex items-center gap-2">
                                        {item.item_name}
                                        {item.is_vegan && <span title="Vegan">🌱</span>}
                                        {item.is_gluten_free && <span title="Gluten-Free">🌾</span>}
                                      </h4>
                                      {item.contributor_name && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                          Contributed by: <span className="text-accent-gold font-medium">{item.contributor_name}</span>
                                        </p>
                                      )}
                                      {item.notes && <p className="text-sm text-gray-400 mt-2">{item.notes}</p>}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                      {potluckItems.length > 4 && (
                        <p className="scroll-hint">↕ Scroll to see all contributions</p>
                      )}
                    </>
                  )}
                  
                  {/* Update RSVP Button - Inside Container */}
                  <Button 
                    asChild 
                    variant="destructive"
                    className="bg-accent-red hover:bg-accent-red/80 glow-gold font-subhead w-full mt-6"
                  >
                    <a href="/rsvp">Update Your RSVP</a>
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Original Potluck Guidelines */}
            <div className="mb-16">
              <h2 className="font-subhead text-3xl text-center mb-8 text-accent-gold">
                Potluck Contribution Guidelines
              </h2>
              
              <div className="grid lg:grid-cols-3 gap-8 mb-8">
                {potluckSuggestions.map((category, index) => (
                  <div 
                    key={index}
                    className="bg-card p-6 rounded-lg border border-accent-purple/30"
                  >
                    <h3 className="font-subhead text-xl mb-4 text-accent-gold">
                      {category.category}
                    </h3>
                    <ul className="space-y-2">
                      {category.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start">
                          <span className="w-2 h-2 bg-accent-red rounded-full mr-3 mt-2 flex-shrink-0"></span>
                          <span className="font-body text-sm text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              
              <div className="bg-bg-2 p-8 rounded-lg border border-accent-gold/30">
                <h3 className="font-subhead text-2xl mb-4 text-accent-gold text-center">
                  Contribution Requirements
                </h3>
                
                {/* Color-Coded System */}
                <div className="mb-6 p-4 bg-accent-purple/10 border border-accent-purple/30 rounded-lg">
                  <h4 className="font-subhead text-lg mb-3 text-accent-gold font-bold text-center">
                    🎨 Color-Coded Contribution System
                  </h4>
                  <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <span className="text-gray-200 font-semibold">Green = Vegan/Vegetarian</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-200 font-semibold">Blue = Gluten-Free</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="text-center md:text-left">
                    <h4 className="font-subhead text-lg mb-3 text-accent-gold">Food Safety & Dietary Needs</h4>
                    <ul className="font-body text-sm text-gray-200 space-y-1 inline-block text-left">
                      <li>• <strong className="text-accent-gold">Include ingredient list for allergens</strong></li>
                      <li>• <strong className="text-accent-gold">Label vegan/vegetarian options clearly</strong></li>
                      <li>• <strong className="text-blue-400">Mark gluten-free items prominently</strong></li>
                      <li>• Keep hot foods hot, cold foods cold</li>
                      <li>• No home-canned items please</li>
                    </ul>
                  </div>
                  <div className="text-center md:text-left">
                    <h4 className="font-subhead text-lg mb-3 text-accent-gold">Presentation</h4>
                    <ul className="font-body text-sm text-gray-200 space-y-1 inline-block text-left">
                      <li>• Bring serving utensils</li>
                      <li>• Include a small card explaining your dish's story</li>
                      <li>• <strong className="text-accent-gold font-bold">Use color-coded labels for dietary info</strong></li>
                      <li>• Creative presentation encouraged</li>
                      <li>• Consider bringing enough for 8-10 people</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            {/* RSVP Reminder */}
            <div className="text-center">
              <div className="bg-card p-8 rounded-lg border border-accent-red/50 max-w-2xl mx-auto">
                <h3 className="font-subhead text-2xl mb-4 text-accent-red">
                  Confirm Your Contribution
                </h3>
                <p className="font-body text-muted-foreground mb-6">
                  Let us know what twisted treat you'll be bringing so we can coordinate 
                  the menu and ensure a balanced feast of horrors.
                </p>
                <Button 
                  asChild 
                  variant="destructive"
                  className="bg-accent-red hover:bg-accent-red/80 glow-gold font-subhead px-8 py-3"
                >
                  <a href="/rsvp">Update Your RSVP</a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />

      {/* Dietary Information Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-subhead">✅ Contribution Added Successfully!</DialogTitle>
            <DialogDescription className="text-base mt-2 font-body">
              Please review the dietary definitions you selected:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {isVegan && (
              <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🌱</span>
                  <h3 className="font-subhead text-lg text-green-800 dark:text-green-200">Vegan</h3>
                </div>
                <p className="text-sm font-body text-green-700 dark:text-green-300">
                  Contains <strong>no animal products</strong> including meat, dairy, eggs, honey, gelatin, or any animal-derived ingredients.
                </p>
              </div>
            )}
            {isGlutenFree && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🌾</span>
                  <h3 className="font-subhead text-lg text-amber-800 dark:text-amber-200">Gluten-Free</h3>
                </div>
                <p className="text-sm font-body text-amber-700 dark:text-amber-300">
                  Contains <strong>no wheat, barley, rye, or their derivatives</strong>. Safe for those with celiac disease or gluten sensitivities.
                </p>
              </div>
            )}
            <p className="text-sm font-body text-muted-foreground">
              By confirming, you acknowledge that your dish meets these dietary requirements.
            </p>
          </div>
          <div className="flex justify-end mt-4">
            <Button 
              onClick={() => setShowConfirmDialog(false)} 
              className="w-full sm:w-auto bg-accent-gold hover:bg-accent-gold/80 text-background font-subhead"
            >
              I Understand
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Feast;