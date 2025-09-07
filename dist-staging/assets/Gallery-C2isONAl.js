import { j as jsxRuntimeExports } from "./ui-34HFLAJ-.js";
import { r as reactExports } from "./vendor-BeeObON2.js";
import { c as createLucideIcon, u as useAuth, d as useToast, s as supabase, N as NavBar, H as HuntHintTrigger, L as Label, I as Input, F as Footer } from "./index-ScHqtWhW.js";
import "./supabase-hOZgWq6G.js";
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Upload = createLucideIcon("Upload", [
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }],
  ["polyline", { points: "17 8 12 3 7 8", key: "t8dd8p" }],
  ["line", { x1: "12", x2: "12", y1: "3", y2: "15", key: "widbto" }]
]);
const Gallery = () => {
  const [images, setImages] = reactExports.useState([]);
  const [uploading, setUploading] = reactExports.useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  reactExports.useEffect(() => {
    loadImages();
  }, []);
  const loadImages = async () => {
    var _a;
    try {
      const { data, error } = await supabase.storage.from("gallery").list("", { limit: 100, sortBy: { column: "created_at", order: "desc" } });
      if (error) throw error;
      const imageUrls = ((_a = data == null ? void 0 : data.filter((file) => file.name.includes("/"))) == null ? void 0 : _a.map((file) => supabase.storage.from("gallery").getPublicUrl(file.name).data.publicUrl)) || [];
      setImages(imageUrls);
    } catch (error) {
      console.error("Error loading images:", error);
    }
  };
  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files || !user) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split(".").pop();
        const filePath = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const { error } = await supabase.storage.from("gallery").upload(filePath, file, {
          cacheControl: "3600",
          upsert: false
        });
        if (error) throw error;
      }
      toast({
        title: "Images uploaded!",
        description: "Your photos have been added to the gallery."
      });
      loadImages();
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };
  const placeholderImages = [
    "https://images.unsplash.com/photo-1509557965043-e78fcf5299ad?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1454391304352-2bf4678b1a7a?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1455218873509-8097305ee378?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1548142813-c348350df52b?w=400&h=400&fit=crop"
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(NavBar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "pt-20", children: /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "py-16 px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto max-w-6xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-heading text-4xl md:text-6xl text-center mb-8 text-shadow-gothic", children: "Gallery of Twisted Tales" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-lg text-center mb-12 text-muted-foreground max-w-3xl mx-auto", children: "Memories from past celebrations and previews of what's to come. Every image tells a story... some darker than others." }),
      user ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-12 text-center relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          HuntHintTrigger,
          {
            id: "gallery.upload",
            label: "A picture is a promise",
            bonus: true,
            className: "absolute -top-2 -right-2"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card p-8 rounded-lg border border-accent-purple/30 max-w-2xl mx-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-subhead text-2xl mb-4 text-accent-gold", children: "Share Your Photos" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "image-upload", className: "cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-2 border-dashed border-accent-purple/50 rounded-lg p-8 hover:border-accent-gold/50 transition-colors", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "mx-auto mb-4 text-accent-purple", size: 48 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-subhead text-accent-purple mb-2", children: "Click to upload images" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-sm text-muted-foreground", children: "Multiple files supported. By uploading, you confirm you have permission to share these images." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "image-upload",
                type: "file",
                accept: "image/*",
                multiple: true,
                onChange: handleFileUpload,
                disabled: uploading,
                className: "sr-only"
              }
            )
          ] }),
          uploading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-sm text-accent-gold mt-4", children: "Uploading..." })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-12 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card p-8 rounded-lg border border-accent-purple/30 max-w-2xl mx-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-subhead text-2xl mb-4 text-accent-gold", children: "Sign In to Share" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-muted-foreground mb-6", children: "Sign in to upload and share your photos from the event." })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4", children: images.length > 0 ? images.map((url, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-square bg-bg-2 rounded-lg overflow-hidden border border-accent-purple/30 hover:border-accent-gold/50 transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: url,
          alt: `Gallery image ${index + 1}`,
          className: "w-full h-full object-cover",
          loading: "lazy",
          decoding: "async"
        }
      ) }, index)) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-full text-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-muted-foreground", children: "No images yet. Be the first to share memories from the bash!" }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center mb-16", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card p-12 rounded-lg border border-accent-purple/30 max-w-3xl mx-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-heading text-6xl mb-6 text-accent-gold", children: "🖼️" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-subhead text-3xl mb-6 text-accent-red", children: "Gallery Opening Soon" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-muted-foreground mb-8 text-lg", children: "Our photographers are still developing the film from last year's celebration. Some images are too dark to process... others refuse to develop at all." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-muted-foreground mb-6", children: "This gallery will feature:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-bg-2 p-4 rounded-lg", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-subhead text-lg mb-2 text-accent-gold", children: "Past Events" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "font-body text-sm text-muted-foreground space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Costume contest winners" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Interactive vignette moments" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Behind-the-scenes preparations" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-bg-2 p-4 rounded-lg", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-subhead text-lg mb-2 text-accent-gold", children: "This Year" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "font-body text-sm text-muted-foreground space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Live event photography" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Guest submissions welcome" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Professional portrait station" })
            ] })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-16", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-subhead text-2xl text-center mb-8 text-accent-gold", children: "Preview: Atmospheric Inspiration" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-4", children: placeholderImages.map((image, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "aspect-square bg-bg-2 rounded-lg overflow-hidden border border-accent-purple/30 hover:border-accent-gold/50 transition-colors motion-safe hover-tilt",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: image,
                alt: `Gallery preview ${index + 1}`,
                className: "w-full h-full object-cover grayscale hover:grayscale-0 transition-all motion-safe"
              }
            )
          },
          index
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-bg-2 p-8 rounded-lg border border-accent-purple/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-subhead text-2xl text-center mb-6 text-accent-gold", children: "Photography Guidelines" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-subhead text-lg mb-4 text-accent-purple", children: "During the Event" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "font-body text-sm text-muted-foreground space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Photography encouraged during designated times" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Respect others' privacy and consent" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• No flash during performances" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Tag us on social media: #TwistedFairytalesBash" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-subhead text-lg mb-4 text-accent-purple", children: "Share Your Photos" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "font-body text-sm text-muted-foreground space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Email your best shots for the gallery" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Professional portrait station available" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Group photos encouraged" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Behind-the-scenes moments welcome" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-muted-foreground italic", children: '"Some memories are too dark to develop, but the best ones glow in the shadows."' }) })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] });
};
export {
  Gallery as default
};
//# sourceMappingURL=Gallery-C2isONAl.js.map
