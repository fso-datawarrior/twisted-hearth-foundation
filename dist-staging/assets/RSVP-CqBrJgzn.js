import { j as jsxRuntimeExports } from "./ui-34HFLAJ-.js";
import { r as reactExports } from "./vendor-BeeObON2.js";
import { a as cn, L as Label, I as Input, d as useToast, N as NavBar, B as Button, f as formatEventShort, e as formatEventTime, F as Footer } from "./index-ScHqtWhW.js";
import { T as Textarea } from "./textarea-DdYboPdA.js";
import { c as createClient } from "./supabase-hOZgWq6G.js";
const FormField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  required = false,
  min,
  max,
  rows = 3,
  className
}) => {
  const baseClasses = "bg-input border-accent-purple/30 text-foreground placeholder:text-muted-foreground focus:border-accent-gold focus:ring-accent-gold/20";
  const handleChange = (e) => {
    onChange(e.target.value);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("space-y-2", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Label,
      {
        htmlFor: name,
        className: "font-subhead text-sm uppercase tracking-wider text-accent-gold",
        children: label
      }
    ),
    type === "textarea" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      Textarea,
      {
        id: name,
        name,
        value,
        onChange: handleChange,
        placeholder,
        required,
        rows,
        className: cn(
          baseClasses,
          error && "border-accent-red focus:border-accent-red focus:ring-accent-red/20",
          "resize-none"
        ),
        "aria-describedby": error ? `${name}-error` : void 0
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      Input,
      {
        id: name,
        name,
        type,
        value,
        onChange: handleChange,
        placeholder,
        required,
        min,
        max,
        className: cn(
          baseClasses,
          error && "border-accent-red focus:border-accent-red focus:ring-accent-red/20"
        ),
        "aria-describedby": error ? `${name}-error` : void 0
      }
    ),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "p",
      {
        id: `${name}-error`,
        className: "font-body text-sm text-accent-red",
        role: "alert",
        children: error
      }
    )
  ] });
};
const supabaseUrl = "https://hsyyculqmeslhwiznjwh.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzeXljdWxxbWVzbGh3aXpuandoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxOTA1MjEsImV4cCI6MjA3Mjc2NjUyMX0.lO0bnmz1TIfe8T9qxFGXYa1FTH1V2EgB7Jq_rK42nMs";
const supabase = createClient(supabaseUrl, supabaseKey);
const RSVP = () => {
  const { toast } = useToast();
  const startRef = reactExports.useRef(Date.now());
  const [formData, setFormData] = reactExports.useState({
    name: "",
    email: "",
    guestCount: 1,
    costumeIdea: "",
    dietary: "",
    contribution: "",
    nickname: ""
    // Honeypot field
  });
  const [errors, setErrors] = reactExports.useState({});
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  const validateForm = () => {
    const newErrors = {};
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
  const handleSubmit = async (e) => {
    var _a, _b;
    e.preventDefault();
    if (Date.now() - startRef.current < 1e3 || formData.nickname) {
      toast({
        title: "RSVP Received!",
        description: "Your twisted tale reservation has been confirmed. Check your email for location details.",
        variant: "default"
      });
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
        const idem = ((_a = crypto == null ? void 0 : crypto.randomUUID) == null ? void 0 : _a.call(crypto)) ?? String(Date.now());
        const { data, error: rpcError } = await supabase.rpc("submit_rsvp", {
          p_name: formData.name,
          p_email: formData.email.toLowerCase().trim(),
          p_num_guests: formData.guestCount,
          p_costume_idea: formData.costumeIdea || null,
          p_dietary: formData.dietary || null,
          p_contributions: formData.contribution || null,
          p_idempotency: idem
        });
        if (rpcError) {
          console.error("RPC Error:", rpcError);
          throw new Error("Failed to save RSVP");
        }
        const rsvpId = (data == null ? void 0 : data.rsvp_id) ?? ((_b = data == null ? void 0 : data[0]) == null ? void 0 : _b.rsvp_id);
        console.log("RSVP saved successfully:", rsvpId);
        try {
          const { error: emailError } = await supabase.functions.invoke("send-rsvp-confirmation", {
            body: {
              rsvpId,
              name: formData.name,
              email: formData.email,
              guests: formData.guestCount
            }
          });
          if (emailError) {
            console.warn("Email send failed:", emailError);
          }
        } catch (emailErr) {
          console.warn("Email function error:", emailErr);
        }
        toast({
          title: "RSVP Received!",
          description: "Your twisted tale reservation has been confirmed. Check your email for location details.",
          variant: "default"
        });
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
  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(NavBar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "pt-20", children: /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "py-16 px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto max-w-3xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-heading text-4xl md:text-6xl text-center mb-8 text-shadow-gothic", children: "Join the Twisted Tale" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-lg text-center mb-12 text-muted-foreground max-w-2xl mx-auto", children: "Secure your place at the most anticipated Halloween event of the year. But beware - not all who enter leave unchanged..." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-card p-8 rounded-lg border border-accent-purple/30 shadow-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", "aria-busy": isSubmitting, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            name: "nickname",
            tabIndex: -1,
            autoComplete: "off",
            className: "hidden",
            "aria-hidden": "true",
            value: formData.nickname,
            onChange: (e) => handleInputChange("nickname", e.target.value)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            FormField,
            {
              label: "Full Name *",
              name: "name",
              type: "text",
              value: formData.name,
              onChange: (value) => handleInputChange("name", value),
              error: errors.name,
              placeholder: "Enter your real name... or your character's"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            FormField,
            {
              label: "Email Address *",
              name: "email",
              type: "email",
              value: formData.email,
              onChange: (value) => handleInputChange("email", value),
              error: errors.email,
              placeholder: "your.email@domain.com"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          FormField,
          {
            label: "Number of Guests *",
            name: "guestCount",
            type: "number",
            value: formData.guestCount,
            onChange: (value) => handleInputChange("guestCount", parseInt(value) || 1),
            error: errors.guestCount,
            min: 1,
            max: 10,
            placeholder: "1"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-accent-purple/30 pt-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-subhead text-xl mb-4 text-accent-gold", children: "Optional Details (Helps Us Prepare)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              FormField,
              {
                label: "Costume Concept",
                name: "costumeIdea",
                type: "textarea",
                value: formData.costumeIdea,
                onChange: (value) => handleInputChange("costumeIdea", value),
                placeholder: "What twisted fairytale character will you embody? Give us a hint...",
                rows: 3
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              FormField,
              {
                label: "Dietary Restrictions",
                name: "dietary",
                type: "textarea",
                value: formData.dietary,
                onChange: (value) => handleInputChange("dietary", value),
                placeholder: "Any allergies, dietary preferences, or foods that might poison you?",
                rows: 2
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              FormField,
              {
                label: "Potluck Contribution",
                name: "contribution",
                type: "textarea",
                value: formData.contribution,
                onChange: (value) => handleInputChange("contribution", value),
                placeholder: "What twisted treat will you bring to share? Describe your dish and its dark story...",
                rows: 3
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-6 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "submit",
              disabled: isSubmitting,
              className: "bg-accent-red hover:bg-accent-red/80 text-ink font-subhead text-lg px-12 py-4 glow-gold motion-safe hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed",
              children: isSubmitting ? "Submitting…" : "Seal Your Fate"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-xs text-muted-foreground mt-4 max-w-md mx-auto", children: "By submitting this RSVP, you agree to participate in interactive storytelling and acknowledge that some content may be intense. 18+ recommended." })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-12 bg-bg-2 p-6 rounded-lg border border-accent-purple/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-subhead text-xl mb-4 text-accent-gold text-center", children: "Event Details" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-3 gap-4 text-center font-body text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block font-subhead text-accent-purple", children: "Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: formatEventShort() })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block font-subhead text-accent-purple", children: "Time" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
              formatEventTime(),
              " - Late"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block font-subhead text-accent-purple", children: "Attire" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Twisted Fairytale Costumes" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-xs text-muted-foreground mt-4", children: "Location details will be provided upon RSVP confirmation via email." })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] });
};
export {
  RSVP as default
};
//# sourceMappingURL=RSVP-CqBrJgzn.js.map
