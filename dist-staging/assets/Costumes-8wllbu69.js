import { j as jsxRuntimeExports } from "./ui-34HFLAJ-.js";
import { r as reactExports } from "./vendor-BeeObON2.js";
import { c as createLucideIcon, a as cn, B as Button, b as ChevronRight, N as NavBar, H as HuntHintTrigger, F as Footer } from "./index-ScHqtWhW.js";
import "./supabase-hOZgWq6G.js";
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ChevronLeft = createLucideIcon("ChevronLeft", [
  ["path", { d: "m15 18-6-6 6-6", key: "1wnfg3" }]
]);
const Carousel = ({
  items,
  visible = 1,
  auto = false,
  interval = 5e3,
  className
}) => {
  const [currentIndex, setCurrentIndex] = reactExports.useState(0);
  const [isPlaying, setIsPlaying] = reactExports.useState(auto);
  reactExports.useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentIndex(
        (prev) => prev + visible >= items.length ? 0 : prev + 1
      );
    }, interval);
    return () => clearInterval(timer);
  }, [isPlaying, interval, items.length, visible]);
  const nextSlide = () => {
    setCurrentIndex(
      (prev) => prev + visible >= items.length ? 0 : prev + 1
    );
  };
  const prevSlide = () => {
    setCurrentIndex(
      (prev) => prev === 0 ? Math.max(0, items.length - visible) : prev - 1
    );
  };
  const goToSlide = (index) => {
    setCurrentIndex(index);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("relative", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "flex transition-transform duration-300 ease-in-out motion-safe",
        style: {
          transform: `translateX(-${currentIndex * 100 / visible}%)`
        },
        children: items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "flex-shrink-0 px-2",
            style: { width: `${100 / visible}%` },
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-lg overflow-hidden border border-accent-purple/30 hover:border-accent-gold/50 transition-colors motion-safe", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-video overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: item.image,
                  alt: item.title,
                  className: "w-full h-full object-cover hover:scale-105 transition-transform motion-safe"
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-subhead text-lg mb-2 text-accent-gold", children: item.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-sm text-muted-foreground", children: item.description })
              ] })
            ] })
          },
          item.id
        ))
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        variant: "outline",
        size: "icon",
        onClick: prevSlide,
        className: "absolute left-2 top-1/2 -translate-y-1/2 bg-bg-2/95 border-accent-purple/50 text-ink hover:bg-accent-purple/20 hover:text-accent-gold z-10",
        "aria-label": "Previous slide",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        variant: "outline",
        size: "icon",
        onClick: nextSlide,
        className: "absolute right-2 top-1/2 -translate-y-1/2 bg-bg-2/95 border-accent-purple/50 text-ink hover:bg-accent-purple/20 hover:text-accent-gold z-10",
        "aria-label": "Next slide",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center mt-4 space-x-2", children: Array.from({ length: Math.ceil(items.length / visible) }).map((_, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => goToSlide(index),
        className: cn(
          "w-3 h-3 rounded-full transition-colors motion-safe focus-visible",
          currentIndex === index ? "bg-accent-gold" : "bg-accent-purple/30 hover:bg-accent-purple/60"
        ),
        "aria-label": `Go to slide group ${index + 1}`
      },
      index
    )) }),
    auto && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        variant: "ghost",
        size: "sm",
        onClick: () => setIsPlaying(!isPlaying),
        className: "text-muted-foreground hover:text-accent-gold",
        children: [
          isPlaying ? "Pause" : "Play",
          " Slideshow"
        ]
      }
    ) })
  ] });
};
const Costumes = () => {
  const [activeFilter, setActiveFilter] = reactExports.useState("All");
  const filterCategories = ["All", "Royalty", "Creatures", "Cursed", "Woodland"];
  const costumeInspiration = [
    {
      id: 1,
      title: "Ragged Queen of Thorns",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop",
      description: "Crown of twisted vines, torn royal robes, ruling from ruins.",
      category: "Royalty"
    },
    {
      id: 2,
      title: "Wolf-Worn Hunter",
      image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=600&fit=crop",
      description: "Red cloak stained with secrets, eyes that have seen too much.",
      category: "Cursed"
    },
    {
      id: 3,
      title: "Moss-Eaten Dryad",
      image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=600&fit=crop",
      description: "Ancient tree spirit, bark for skin, leaves for hair.",
      category: "Woodland"
    },
    {
      id: 4,
      title: "Poisoned Princess",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=600&fit=crop",
      description: "Beauty preserved by toxins, apple-red lips that kill with a kiss.",
      category: "Royalty"
    },
    {
      id: 5,
      title: "Spectral Swan",
      image: "https://images.unsplash.com/photo-1516726817505-f5ed825624d8?w=400&h=600&fit=crop",
      description: "Cursed to dance forever, feathers falling like snow.",
      category: "Cursed"
    },
    {
      id: 6,
      title: "Bear King's Heir",
      image: "https://images.unsplash.com/photo-1485062934645-5c8021e4b5b5?w=400&h=600&fit=crop",
      description: "Royal beast with crown of bone, civilized but wild.",
      category: "Creatures"
    },
    {
      id: 7,
      title: "Thorn Witch of the Briar",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop",
      description: "Guardian of sleeping curses, spinner of endless dreams.",
      category: "Woodland"
    },
    {
      id: 8,
      title: "Shadow Court Jester",
      image: "https://images.unsplash.com/photo-1454391304352-2bf4678b1a7a?w=400&h=600&fit=crop",
      description: "Entertainer of the damned, jokes that cut like knives.",
      category: "Royalty"
    },
    {
      id: 9,
      title: "Raven Parliament Speaker",
      image: "https://images.unsplash.com/photo-1455218873509-8097305ee378?w=400&h=600&fit=crop",
      description: "Collector of secrets, keeper of dark prophecies.",
      category: "Creatures"
    },
    {
      id: 10,
      title: "Mushroom Circle Keeper",
      image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=600&fit=crop",
      description: "Guardian of fairy rings, dealer in dangerous bargains.",
      category: "Woodland"
    },
    {
      id: 11,
      title: "Mirror Shard Collector",
      image: "https://images.unsplash.com/photo-1548142813-c348350df52b?w=400&h=600&fit=crop",
      description: "Seven reflections, each showing a different truth.",
      category: "Cursed"
    },
    {
      id: 12,
      title: "Bone Crown Emperor",
      image: "https://images.unsplash.com/photo-1509557965043-e78fcf5299ad?w=400&h=600&fit=crop",
      description: "Ruler of forgotten kingdoms, crowned with the past.",
      category: "Royalty"
    }
  ];
  const filteredCostumes = activeFilter === "All" ? costumeInspiration : costumeInspiration.filter((costume) => costume.category === activeFilter);
  const costumeCategories = [
    {
      title: "Classic with a Twist",
      description: "Take a beloved character and add a modern, dark, or unexpected element",
      examples: ["Therapist Fairy Godmother", "Divorced Prince Charming", "Unionized Seven Dwarfs"]
    },
    {
      title: "Modern Reimagining",
      description: "Place fairytale characters in contemporary settings with relevant themes",
      examples: ["Tech Startup Wizard", "Social Media Witch", "Gig Economy Genie"]
    },
    {
      title: "Role Reversal",
      description: "Flip the traditional roles - make villains heroic or heroes villainous",
      examples: ["Misunderstood Dragon", "Corporate Stepmother", "Activist Big Bad Wolf"]
    },
    {
      title: "Original Creation",
      description: "Invent your own twisted fairytale character with a compelling backstory",
      examples: ["The 13th Fairy Godmother", "Midnight's Accountant", "The Sequel Princess"]
    }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(NavBar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "pt-20", children: /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "py-16 px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto max-w-6xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          HuntHintTrigger,
          {
            id: "costumes.header",
            label: "Masks within masks",
            className: "absolute top-0 right-4"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-heading text-4xl md:text-6xl text-center mb-8 text-shadow-gothic", children: "Costume Inspiration Gallery" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-lg text-center mb-12 text-muted-foreground max-w-3xl mx-auto", children: "Transform your favorite fairytale character with a twisted modern interpretation. The more creative and thought-provoking, the better!" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-center gap-3", id: "costumes.filter", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          HuntHintTrigger,
          {
            id: "costumes.filter",
            label: "Choose your mask wisely",
            bonus: true,
            className: "absolute -top-2 -right-2"
          }
        ),
        filterCategories.map((category) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setActiveFilter(category),
            className: `px-4 py-2 rounded-full font-subhead text-sm transition-colors motion-safe focus-visible ${activeFilter === category ? "bg-accent-gold text-background" : "bg-bg-2 text-ink hover:bg-accent-purple/20 border border-accent-purple/30"}`,
            children: category
          },
          category
        ))
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-16", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-subhead text-3xl text-center mb-8 text-accent-gold", children: "Featured Twisted Interpretations" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Carousel,
          {
            items: filteredCostumes,
            visible: 3,
            auto: true,
            interval: 5e3,
            className: "mb-8"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-16", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-subhead text-3xl text-center mb-8 text-accent-gold", children: "Costume Categories & Ideas" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid md:grid-cols-2 gap-8", children: costumeCategories.map((category, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "bg-card p-8 rounded-lg border border-accent-purple/30 hover:border-accent-gold/50 transition-colors motion-safe",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-subhead text-xl mb-4 text-accent-purple", children: category.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-muted-foreground mb-4", children: category.description }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-subhead text-sm uppercase text-accent-gold", children: "Examples:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "font-body text-sm text-muted-foreground", children: category.examples.map((example, exIndex) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 bg-accent-red rounded-full mr-3 flex-shrink-0" }),
                  example
                ] }, exIndex)) })
              ] })
            ]
          },
          index
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative bg-bg-2 p-8 rounded-lg border border-accent-red/50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          HuntHintTrigger,
          {
            id: "costumes.cta",
            label: "Seams stitched with secrets",
            className: "absolute bottom-4 right-4"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-subhead text-3xl text-center mb-6 text-accent-red", children: "Costume Contest Prizes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-3 gap-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-heading text-4xl mb-2 text-accent-gold", children: "🏆" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-subhead text-lg mb-2 text-accent-gold", children: "Most Creative Twist" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-sm text-muted-foreground", children: "For the most innovative interpretation of a classic character" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-heading text-4xl mb-2 text-accent-gold", children: "🎭" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-subhead text-lg mb-2 text-accent-gold", children: "Best Original Character" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-sm text-muted-foreground", children: "For creating an entirely new twisted fairytale persona" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-heading text-4xl mb-2 text-accent-gold", children: "⚡" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-subhead text-lg mb-2 text-accent-gold", children: "Most Topical" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-sm text-muted-foreground", children: "For best incorporation of current events or social commentary" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-muted-foreground mb-4", children: "Judging will take place during the Costume Parade at 9:30 PM. Be prepared to present your character and explain your twisted interpretation!" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-subhead text-accent-red", children: '"The best costumes tell a story... preferably one with a dark ending."' })
        ] })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] });
};
export {
  Costumes as default
};
//# sourceMappingURL=Costumes-8wllbu69.js.map
