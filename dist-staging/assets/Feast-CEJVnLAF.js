import { j as jsxRuntimeExports } from "./ui-34HFLAJ-.js";
import { r as reactExports } from "./vendor-BeeObON2.js";
import { u as useAuth, d as useToast, N as NavBar, H as HuntHintTrigger, L as Label, I as Input, B as Button, F as Footer, s as supabase } from "./index-ScHqtWhW.js";
import { T as Textarea } from "./textarea-DdYboPdA.js";
import "./supabase-hOZgWq6G.js";
const Feast = () => {
  const [potluckItems, setPotluckItems] = reactExports.useState([]);
  const [itemName, setItemName] = reactExports.useState("");
  const [notes, setNotes] = reactExports.useState("");
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  reactExports.useEffect(() => {
    const loadPotluckItems = async () => {
      const { data, error } = await supabase.from("potluck_items").select("*").order("created_at", { ascending: false }).limit(50);
      if (error) {
        console.error("Error loading potluck items:", error);
      } else {
        setPotluckItems(data || []);
      }
    };
    loadPotluckItems();
  }, []);
  const handleSubmitItem = async (e) => {
    e.preventDefault();
    if (!user || !itemName.trim()) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from("potluck_items").insert({
        user_id: user.id,
        item_name: itemName.trim(),
        notes: notes.trim() || null
      }).select().single();
      if (error) throw error;
      setPotluckItems([data, ...potluckItems]);
      setItemName("");
      setNotes("");
      toast({
        title: "Contribution added!",
        description: "Your dish has been added to the feast."
      });
    } catch (error) {
      console.error("Error adding potluck item:", error);
      toast({
        title: "Failed to add item",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const signatureDrinks = [
    {
      name: "Poison Apple Martini",
      description: "Green apple vodka, sour apple schnapps, and a hint of cinnamon. Garnished with a red wax seal.",
      ingredients: "Vodka, Apple Schnapps, Lime, Simple Syrup"
    },
    {
      name: "Blood Wine of the Beast",
      description: "Deep red wine blend with blackberry and pomegranate. Served in goblets with dry ice.",
      ingredients: "Cabernet, Blackberry Liqueur, Pomegranate Juice"
    },
    {
      name: "Sleeping Beauty's Nightcap",
      description: "Lavender-infused gin with butterfly pea flower tea. Changes color when citrus is added.",
      ingredients: "Gin, Lavender, Butterfly Pea Tea, Lemon"
    },
    {
      name: "Rumpelstiltskin's Gold",
      description: "Bourbon cocktail with honey and gold leaf. The price of magic in liquid form.",
      ingredients: "Bourbon, Honey Syrup, Lemon, Gold Leaf"
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(NavBar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "pt-20", children: /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "py-16 px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto max-w-6xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          HuntHintTrigger,
          {
            id: "feast.header",
            label: "Flavor sharp as a blade",
            className: "absolute top-0 right-4"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-heading text-4xl md:text-6xl text-center mb-8 text-shadow-gothic", children: "Feast of Dark Delights" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-lg text-center mb-12 text-muted-foreground max-w-3xl mx-auto", children: "A twisted potluck where every dish tells a story. Bring something inspired by your favorite (or most feared) fairytale, and we'll provide the libations to wash down the darkness." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-16", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-subhead text-3xl text-center mb-8 text-accent-gold", children: "Signature Libations" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid md:grid-cols-2 gap-8", children: signatureDrinks.map((drink, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "bg-card p-6 rounded-lg border border-accent-purple/30 hover:border-accent-gold/50 transition-colors motion-safe relative",
            children: [
              index === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                HuntHintTrigger,
                {
                  id: "feast.board",
                  label: "A diced confession",
                  className: "absolute top-2 right-2"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-subhead text-xl mb-3 text-accent-red", children: drink.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-muted-foreground mb-4", children: drink.description }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-subhead text-accent-gold", children: "Ingredients: " }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-body text-muted-foreground", children: drink.ingredients })
              ] })
            ]
          },
          index
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-bg-2 p-6 rounded-lg border border-accent-purple/30 max-w-2xl mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-body text-muted-foreground mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-accent-red", children: "Note:" }),
          ` All cocktails are crafted by our resident potion master. Non-alcoholic "virgin potions" available upon request. Please drink responsibly - we can't guarantee what these brews might reveal about your true nature.`
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-16 relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          HuntHintTrigger,
          {
            id: "feast.potluck",
            label: "What's shared tastes sweeter",
            bonus: true,
            className: "absolute -top-2 -right-2 z-10"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-subhead text-3xl text-center mb-8 text-accent-gold", children: "Potluck Contributions" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-center mb-8 text-muted-foreground max-w-2xl mx-auto", children: "Bring a dish for the banquet table—beware the knives. See what others are contributing and add your own twisted creation to the feast." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-2 gap-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card p-6 rounded-lg border border-accent-purple/30", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-subhead text-xl mb-4 text-accent-purple", children: "Add Your Contribution" }),
            user ? /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmitItem, className: "space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "item_name", className: "font-subhead text-accent-gold", children: "Dish Name" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "item_name",
                    value: itemName,
                    onChange: (e) => setItemName(e.target.value),
                    placeholder: "e.g., Grandmother's Secret Stew",
                    maxLength: 80,
                    required: true,
                    disabled: isLoading,
                    className: "bg-background border-accent-purple/30 focus:border-accent-gold"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: [
                  itemName.length,
                  "/80 characters"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "notes", className: "font-subhead text-accent-gold", children: "Notes (Optional)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Textarea,
                  {
                    id: "notes",
                    value: notes,
                    onChange: (e) => setNotes(e.target.value),
                    placeholder: "Any special ingredients, dietary info, or dark secrets...",
                    maxLength: 140,
                    rows: 3,
                    disabled: isLoading,
                    className: "bg-background border-accent-purple/30 focus:border-accent-gold"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: [
                  notes.length,
                  "/140 characters"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "submit",
                  disabled: isLoading || !itemName.trim(),
                  className: "w-full bg-accent-gold hover:bg-accent-gold/80 text-background font-subhead",
                  children: isLoading ? "Adding..." : "Add to Feast"
                }
              )
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-muted-foreground mb-4", children: "Sign in to add what you'll bring to the feast" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  onClick: () => {
                  },
                  variant: "outline",
                  className: "border-accent-purple hover:bg-accent-purple/10 font-subhead",
                  children: "Sign In to Contribute"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card p-6 rounded-lg border border-accent-purple/30", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-subhead text-xl mb-4 text-accent-purple", children: "Current Contributions" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4 max-h-96 overflow-y-auto", role: "region", "aria-label": "Potluck contributions list", children: potluckItems.length > 0 ? potluckItems.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-bg-2 p-4 rounded border border-accent-purple/20", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-subhead text-accent-gold text-sm", children: item.item_name }),
              item.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-xs text-muted-foreground mt-1", children: item.notes }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-2", children: [
                "Added ",
                new Date(item.created_at).toLocaleDateString()
              ] })
            ] }, item.id)) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-muted-foreground", children: "No contributions yet. Be the first to add a dish!" }) }) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-16", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-subhead text-3xl text-center mb-8 text-accent-gold", children: "Potluck Contribution Guidelines" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid lg:grid-cols-3 gap-8 mb-8", children: potluckSuggestions.map((category, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "bg-card p-6 rounded-lg border border-accent-purple/30",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-subhead text-xl mb-4 text-accent-purple", children: category.category }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: category.items.map((item, itemIndex) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 bg-accent-red rounded-full mr-3 mt-2 flex-shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-body text-sm text-muted-foreground", children: item })
              ] }, itemIndex)) })
            ]
          },
          index
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-bg-2 p-8 rounded-lg border border-accent-gold/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-subhead text-2xl mb-4 text-accent-gold text-center", children: "Contribution Requirements" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-subhead text-lg mb-3 text-accent-purple", children: "Food Safety" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "font-body text-sm text-muted-foreground space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Include ingredient list for allergens" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Keep hot foods hot, cold foods cold" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Label if vegetarian/vegan/gluten-free" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• No home-canned items please" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-subhead text-lg mb-3 text-accent-purple", children: "Presentation" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "font-body text-sm text-muted-foreground space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Bring serving utensils" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Include a small card explaining your dish's story" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Creative presentation encouraged" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Consider bringing enough for 8-10 people" })
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card p-8 rounded-lg border border-accent-red/50 max-w-2xl mx-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-subhead text-2xl mb-4 text-accent-red", children: "Confirm Your Contribution" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-muted-foreground mb-6", children: "Let us know what twisted treat you'll be bringing so we can coordinate the menu and ensure a balanced feast of horrors." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            asChild: true,
            variant: "destructive",
            className: "bg-accent-red hover:bg-accent-red/80 glow-gold font-subhead px-8 py-3",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/rsvp", children: "Update Your RSVP" })
          }
        )
      ] }) })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] });
};
export {
  Feast as default
};
//# sourceMappingURL=Feast-CEJVnLAF.js.map
