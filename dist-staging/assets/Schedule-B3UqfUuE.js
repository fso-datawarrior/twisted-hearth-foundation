import { j as jsxRuntimeExports } from "./ui-34HFLAJ-.js";
import { N as NavBar, H as HuntHintTrigger, F as Footer } from "./index-ScHqtWhW.js";
import "./vendor-BeeObON2.js";
import "./supabase-hOZgWq6G.js";
const Schedule = () => {
  const scheduleItems = [
    {
      time: "6:30 PM",
      title: "Gates Open: Welcome to the Dark Forest",
      description: "Arrival and check-in. The ancient gates creak open as twilight falls. Receive your story cards and choose your path through the evening's twisted tales.",
      type: "arrival"
    },
    {
      time: "7:15 PM",
      title: "Welcome Gathering & Poison Toasts",
      description: "Signature cocktails served as we gather in the main hall. Meet your fellow travelers on this dark journey.",
      type: "social"
    },
    {
      time: "8:00 PM",
      title: "Vignettes Loop Begins",
      description: "Wander room to room; each tale changes on each pass. Interactive storytelling where you shape the narrative. Multiple paths, darker endings.",
      type: "performance"
    },
    {
      time: "8:45 PM",
      title: "Feast of the Damned",
      description: "Twisted fairytale potluck dinner begins. Each dish tells its own dark story, each bite a new chapter.",
      type: "feast"
    },
    {
      time: "9:00 PM",
      title: "Costume Court Begins",
      description: "Showcase your twisted fairytale character. Judges evaluate creativity, presentation, and the darkness of your tale.",
      type: "contest"
    },
    {
      time: "10:00 PM",
      title: "The Midnight Vignettes Continue",
      description: "The stories grow darker as the night deepens. New scenes unlock, old secrets are revealed.",
      type: "performance"
    },
    {
      time: "10:45 PM",
      title: "Final Toast & The Last Dance",
      description: "As midnight approaches, we gather one last time. The music plays, but some dances never end.",
      type: "finale"
    }
  ];
  const getTypeColor = (type) => {
    switch (type) {
      case "arrival":
        return "text-accent-gold border-accent-gold";
      case "social":
        return "text-accent-green border-accent-green";
      case "performance":
        return "text-accent-purple border-accent-purple";
      case "feast":
        return "text-accent-red border-accent-red";
      case "contest":
        return "text-accent-gold border-accent-gold";
      case "dance":
        return "text-accent-green border-accent-green";
      case "finale":
        return "text-accent-red border-accent-red";
      default:
        return "text-ink border-ink";
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(NavBar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "pt-20", children: /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "py-16 px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto max-w-4xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          HuntHintTrigger,
          {
            id: "schedule.date",
            label: "Time keeps darker promises",
            className: "absolute top-0 right-4"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-heading text-4xl md:text-6xl text-center mb-8 text-shadow-gothic", children: "Schedule of Dark Delights" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-lg text-center mb-12 text-muted-foreground max-w-3xl mx-auto", children: "The evening unfolds like a storybook, with each chapter bringing new twists and turns. Come prepared to participate - this isn't a passive experience." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { role: "list", className: "space-y-6", children: scheduleItems.map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "li",
        {
          className: "bg-card p-6 rounded-lg border border-accent-purple/30 hover:border-accent-gold/50 transition-colors motion-safe relative",
          children: [
            item.type === "finale" && /* @__PURE__ */ jsxRuntimeExports.jsx(
              HuntHintTrigger,
              {
                id: "schedule.late",
                label: "Midnight keeps its own time",
                bonus: true,
                className: "absolute top-4 right-4"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row md:items-start gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "time",
                {
                  dateTime: item.time,
                  className: `font-subhead text-2xl font-bold ${getTypeColor(item.type).split(" ")[0]} bg-bg-2 px-4 py-2 rounded-lg border-2 ${getTypeColor(item.type).split(" ")[1]} block`,
                  children: item.time
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-grow", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-subhead text-xl mb-2 text-accent-gold", children: item.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-muted-foreground", children: item.description })
              ] })
            ] })
          ]
        },
        index
      )) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-16 grid md:grid-cols-2 gap-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-bg-2 p-8 rounded-lg border border-accent-purple/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-subhead text-2xl mb-4 text-accent-red", children: "Important Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "font-body text-muted-foreground space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Interactive experiences require participation" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Some content may be intense - 18+ recommended" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Photography encouraged during designated times" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Stay in character for the full experience" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-bg-2 p-8 rounded-lg border border-accent-purple/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-subhead text-2xl mb-4 text-accent-gold", children: "What to Bring" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "font-body text-muted-foreground space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Your twisted fairytale costume" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• A potluck dish (fairytale themed preferred)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• An open mind and brave heart" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Your story participation cards (provided)" })
          ] })
        ] })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] });
};
export {
  Schedule as default
};
//# sourceMappingURL=Schedule-B3UqfUuE.js.map
