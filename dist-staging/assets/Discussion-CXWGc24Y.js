import { j as jsxRuntimeExports, c as createContextScope, d as Presence, P as Primitive, b as useControllableState, u as useComposedRefs, e as composeEventHandlers, H as useSize } from "./ui-34HFLAJ-.js";
import { r as reactExports, R as React } from "./vendor-BeeObON2.js";
import { c as createLucideIcon, a as cn, g as Check, u as useAuth, d as useToast, L as Label, I as Input, B as Button, s as supabase, D as DropdownMenu, h as DropdownMenuTrigger, i as DropdownMenuContent, j as DropdownMenuItem, N as NavBar, H as HuntHintTrigger, F as Footer, A as AuthModal } from "./index-ScHqtWhW.js";
import { T as Textarea } from "./textarea-DdYboPdA.js";
import { M as MessageCircle } from "./message-circle-DiBU6sqa.js";
import "./supabase-hOZgWq6G.js";
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ellipsis = createLucideIcon("Ellipsis", [
  ["circle", { cx: "12", cy: "12", r: "1", key: "41hilf" }],
  ["circle", { cx: "19", cy: "12", r: "1", key: "1wjl8i" }],
  ["circle", { cx: "5", cy: "12", r: "1", key: "1pcz8c" }]
]);
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Flag = createLucideIcon("Flag", [
  ["path", { d: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z", key: "i9b6wo" }],
  ["line", { x1: "4", x2: "4", y1: "22", y2: "15", key: "1cm3nv" }]
]);
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Loader = createLucideIcon("Loader", [
  ["path", { d: "M12 2v4", key: "3427ic" }],
  ["path", { d: "m16.2 7.8 2.9-2.9", key: "r700ao" }],
  ["path", { d: "M18 12h4", key: "wj9ykh" }],
  ["path", { d: "m16.2 16.2 2.9 2.9", key: "1bxg5t" }],
  ["path", { d: "M12 18v4", key: "jadmvz" }],
  ["path", { d: "m4.9 19.1 2.9-2.9", key: "bwix9q" }],
  ["path", { d: "M2 12h4", key: "j09sii" }],
  ["path", { d: "m4.9 4.9 2.9 2.9", key: "giyufr" }]
]);
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const SquarePen = createLucideIcon("SquarePen", [
  ["path", { d: "M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7", key: "1m0v6g" }],
  [
    "path",
    {
      d: "M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z",
      key: "ohrbg2"
    }
  ]
]);
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Trash2 = createLucideIcon("Trash2", [
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6", key: "4alrt4" }],
  ["path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2", key: "v07s0e" }],
  ["line", { x1: "10", x2: "10", y1: "11", y2: "17", key: "1uufr5" }],
  ["line", { x1: "14", x2: "14", y1: "11", y2: "17", key: "xtxkd" }]
]);
function usePrevious(value) {
  const ref = reactExports.useRef({ value, previous: value });
  return reactExports.useMemo(() => {
    if (ref.current.value !== value) {
      ref.current.previous = ref.current.value;
      ref.current.value = value;
    }
    return ref.current.previous;
  }, [value]);
}
var CHECKBOX_NAME = "Checkbox";
var [createCheckboxContext, createCheckboxScope] = createContextScope(CHECKBOX_NAME);
var [CheckboxProviderImpl, useCheckboxContext] = createCheckboxContext(CHECKBOX_NAME);
function CheckboxProvider(props) {
  const {
    __scopeCheckbox,
    checked: checkedProp,
    children,
    defaultChecked,
    disabled,
    form,
    name,
    onCheckedChange,
    required,
    value = "on",
    // @ts-expect-error
    internal_do_not_use_render
  } = props;
  const [checked, setChecked] = useControllableState({
    prop: checkedProp,
    defaultProp: defaultChecked ?? false,
    onChange: onCheckedChange,
    caller: CHECKBOX_NAME
  });
  const [control, setControl] = reactExports.useState(null);
  const [bubbleInput, setBubbleInput] = reactExports.useState(null);
  const hasConsumerStoppedPropagationRef = reactExports.useRef(false);
  const isFormControl = control ? !!form || !!control.closest("form") : (
    // We set this to true by default so that events bubble to forms without JS (SSR)
    true
  );
  const context = {
    checked,
    disabled,
    setChecked,
    control,
    setControl,
    name,
    form,
    value,
    hasConsumerStoppedPropagationRef,
    required,
    defaultChecked: isIndeterminate(defaultChecked) ? false : defaultChecked,
    isFormControl,
    bubbleInput,
    setBubbleInput
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    CheckboxProviderImpl,
    {
      scope: __scopeCheckbox,
      ...context,
      children: isFunction(internal_do_not_use_render) ? internal_do_not_use_render(context) : children
    }
  );
}
var TRIGGER_NAME = "CheckboxTrigger";
var CheckboxTrigger = reactExports.forwardRef(
  ({ __scopeCheckbox, onKeyDown, onClick, ...checkboxProps }, forwardedRef) => {
    const {
      control,
      value,
      disabled,
      checked,
      required,
      setControl,
      setChecked,
      hasConsumerStoppedPropagationRef,
      isFormControl,
      bubbleInput
    } = useCheckboxContext(TRIGGER_NAME, __scopeCheckbox);
    const composedRefs = useComposedRefs(forwardedRef, setControl);
    const initialCheckedStateRef = reactExports.useRef(checked);
    reactExports.useEffect(() => {
      const form = control == null ? void 0 : control.form;
      if (form) {
        const reset = () => setChecked(initialCheckedStateRef.current);
        form.addEventListener("reset", reset);
        return () => form.removeEventListener("reset", reset);
      }
    }, [control, setChecked]);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.button,
      {
        type: "button",
        role: "checkbox",
        "aria-checked": isIndeterminate(checked) ? "mixed" : checked,
        "aria-required": required,
        "data-state": getState(checked),
        "data-disabled": disabled ? "" : void 0,
        disabled,
        value,
        ...checkboxProps,
        ref: composedRefs,
        onKeyDown: composeEventHandlers(onKeyDown, (event) => {
          if (event.key === "Enter") event.preventDefault();
        }),
        onClick: composeEventHandlers(onClick, (event) => {
          setChecked((prevChecked) => isIndeterminate(prevChecked) ? true : !prevChecked);
          if (bubbleInput && isFormControl) {
            hasConsumerStoppedPropagationRef.current = event.isPropagationStopped();
            if (!hasConsumerStoppedPropagationRef.current) event.stopPropagation();
          }
        })
      }
    );
  }
);
CheckboxTrigger.displayName = TRIGGER_NAME;
var Checkbox$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeCheckbox,
      name,
      checked,
      defaultChecked,
      required,
      disabled,
      value,
      onCheckedChange,
      form,
      ...checkboxProps
    } = props;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      CheckboxProvider,
      {
        __scopeCheckbox,
        checked,
        defaultChecked,
        disabled,
        required,
        onCheckedChange,
        name,
        form,
        value,
        internal_do_not_use_render: ({ isFormControl }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            CheckboxTrigger,
            {
              ...checkboxProps,
              ref: forwardedRef,
              __scopeCheckbox
            }
          ),
          isFormControl && /* @__PURE__ */ jsxRuntimeExports.jsx(
            CheckboxBubbleInput,
            {
              __scopeCheckbox
            }
          )
        ] })
      }
    );
  }
);
Checkbox$1.displayName = CHECKBOX_NAME;
var INDICATOR_NAME = "CheckboxIndicator";
var CheckboxIndicator = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeCheckbox, forceMount, ...indicatorProps } = props;
    const context = useCheckboxContext(INDICATOR_NAME, __scopeCheckbox);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Presence,
      {
        present: forceMount || isIndeterminate(context.checked) || context.checked === true,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Primitive.span,
          {
            "data-state": getState(context.checked),
            "data-disabled": context.disabled ? "" : void 0,
            ...indicatorProps,
            ref: forwardedRef,
            style: { pointerEvents: "none", ...props.style }
          }
        )
      }
    );
  }
);
CheckboxIndicator.displayName = INDICATOR_NAME;
var BUBBLE_INPUT_NAME = "CheckboxBubbleInput";
var CheckboxBubbleInput = reactExports.forwardRef(
  ({ __scopeCheckbox, ...props }, forwardedRef) => {
    const {
      control,
      hasConsumerStoppedPropagationRef,
      checked,
      defaultChecked,
      required,
      disabled,
      name,
      value,
      form,
      bubbleInput,
      setBubbleInput
    } = useCheckboxContext(BUBBLE_INPUT_NAME, __scopeCheckbox);
    const composedRefs = useComposedRefs(forwardedRef, setBubbleInput);
    const prevChecked = usePrevious(checked);
    const controlSize = useSize(control);
    reactExports.useEffect(() => {
      const input = bubbleInput;
      if (!input) return;
      const inputProto = window.HTMLInputElement.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(
        inputProto,
        "checked"
      );
      const setChecked = descriptor.set;
      const bubbles = !hasConsumerStoppedPropagationRef.current;
      if (prevChecked !== checked && setChecked) {
        const event = new Event("click", { bubbles });
        input.indeterminate = isIndeterminate(checked);
        setChecked.call(input, isIndeterminate(checked) ? false : checked);
        input.dispatchEvent(event);
      }
    }, [bubbleInput, prevChecked, checked, hasConsumerStoppedPropagationRef]);
    const defaultCheckedRef = reactExports.useRef(isIndeterminate(checked) ? false : checked);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.input,
      {
        type: "checkbox",
        "aria-hidden": true,
        defaultChecked: defaultChecked ?? defaultCheckedRef.current,
        required,
        disabled,
        name,
        value,
        form,
        ...props,
        tabIndex: -1,
        ref: composedRefs,
        style: {
          ...props.style,
          ...controlSize,
          position: "absolute",
          pointerEvents: "none",
          opacity: 0,
          margin: 0,
          // We transform because the input is absolutely positioned but we have
          // rendered it **after** the button. This pulls it back to sit on top
          // of the button.
          transform: "translateX(-100%)"
        }
      }
    );
  }
);
CheckboxBubbleInput.displayName = BUBBLE_INPUT_NAME;
function isFunction(value) {
  return typeof value === "function";
}
function isIndeterminate(checked) {
  return checked === "indeterminate";
}
function getState(checked) {
  return isIndeterminate(checked) ? "indeterminate" : checked ? "checked" : "unchecked";
}
const Checkbox = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Checkbox$1,
  {
    ref,
    className: cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckboxIndicator, { className: cn("flex items-center justify-center text-current"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }) })
  }
));
Checkbox.displayName = Checkbox$1.displayName;
const MessageComposer = ({
  onMessagePosted,
  isReply = false,
  postId,
  onCancel
}) => {
  const [displayName, setDisplayName] = reactExports.useState("");
  const [message, setMessage] = reactExports.useState("");
  const [isAnonymous, setIsAnonymous] = reactExports.useState(false);
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  React.useEffect(() => {
    if ((user == null ? void 0 : user.email) && !displayName) {
      setDisplayName(user.email.split("@")[0]);
    }
  }, [user, displayName]);
  const handleSubmit = async (e) => {
    var _a;
    e.preventDefault();
    if (!user || !message.trim()) return;
    if (message.length > 2e3) {
      toast({
        title: "Message too long",
        description: "Please keep your message under 2000 characters.",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    try {
      if (isReply && postId) {
        const { error } = await supabase.from("guestbook_replies").insert({
          post_id: postId,
          user_id: user.id,
          display_name: isAnonymous ? "Anonymous" : displayName.trim(),
          message: message.trim(),
          is_anonymous: isAnonymous
        });
        if (error) throw error;
        toast({ title: "Reply posted!" });
      } else {
        const { error } = await supabase.rpc("guestbook_insert_message", {
          p_display_name: isAnonymous ? "Anonymous" : displayName.trim(),
          p_message: message.trim(),
          p_is_anonymous: isAnonymous
        });
        if (error) throw error;
        toast({ title: "Message posted!", description: "Your note has been added to the guestbook." });
      }
      setMessage("");
      if (!isAnonymous) setDisplayName(((_a = user.email) == null ? void 0 : _a.split("@")[0]) || "");
      setIsAnonymous(false);
      onMessagePosted == null ? void 0 : onMessagePosted();
      if (isReply) onCancel == null ? void 0 : onCancel();
    } catch (error) {
      toast({
        title: "Failed to post",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card p-6 rounded-lg border border-accent-purple/30", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-5 w-5 text-accent-gold" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-subhead text-lg text-accent-gold", children: isReply ? "Reply to Message" : "Share Your Twisted Tale" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "displayName", className: "font-body text-sm", children: "Display Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "displayName",
            value: displayName,
            onChange: (e) => setDisplayName(e.target.value),
            placeholder: "How should others know you?",
            disabled: isAnonymous,
            className: "bg-bg-2 border-accent-purple/20 focus:border-accent-gold"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "message", className: "font-body text-sm", children: "Your Message" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Textarea,
          {
            id: "message",
            value: message,
            onChange: (e) => setMessage(e.target.value),
            placeholder: "Share your thoughts, theories, or twisted tales...",
            className: "min-h-[100px] bg-bg-2 border-accent-purple/20 focus:border-accent-gold resize-none",
            maxLength: 2e3
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground text-right", children: [
          message.length,
          "/2000 characters"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Checkbox,
          {
            id: "anonymous",
            checked: isAnonymous,
            onCheckedChange: (checked) => setIsAnonymous(checked)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "anonymous", className: "font-body text-sm cursor-pointer", children: "Post anonymously (hosts can still see who posted)" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "submit",
            disabled: isLoading || !message.trim(),
            className: "bg-accent-red hover:bg-accent-red/80 glow-gold font-subhead px-6",
            children: isLoading ? "Posting..." : isReply ? "Post Reply" : "Post Message"
          }
        ),
        isReply && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            variant: "outline",
            onClick: onCancel,
            className: "border-accent-purple/30 hover:bg-accent-purple/10",
            children: "Cancel"
          }
        )
      ] })
    ] })
  ] });
};
const AVAILABLE_EMOJIS = ["🎃", "🕯️", "🩸", "🕷️", "👻", "💀", "❤️"];
const EmojiReactions = ({ postId }) => {
  const [reactions, setReactions] = reactExports.useState([]);
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const { user } = useAuth();
  reactExports.useEffect(() => {
    loadReactions();
  }, [postId, user]);
  const loadReactions = async () => {
    const { data, error } = await supabase.from("guestbook_reactions").select("emoji, user_id").eq("post_id", postId);
    if (error || !data) return;
    const reactionCounts = AVAILABLE_EMOJIS.map((emoji) => {
      const emojiReactions = data.filter((r) => r.emoji === emoji);
      return {
        emoji,
        count: emojiReactions.length,
        userReacted: user ? emojiReactions.some((r) => r.user_id === user.id) : false
      };
    }).filter((r) => r.count > 0 || r.userReacted);
    setReactions(reactionCounts);
  };
  const handleReaction = async (emoji) => {
    if (!user || isLoading) return;
    setIsLoading(true);
    try {
      const existingReaction = reactions.find((r) => r.emoji === emoji && r.userReacted);
      if (existingReaction) {
        const { error } = await supabase.from("guestbook_reactions").delete().eq("post_id", postId).eq("user_id", user.id).eq("emoji", emoji);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("guestbook_reactions").insert({
          post_id: postId,
          user_id: user.id,
          emoji
        });
        if (error) throw error;
      }
      await loadReactions();
    } catch (error) {
      console.error("Failed to toggle reaction:", error);
    } finally {
      setIsLoading(false);
    }
  };
  if (!user) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: AVAILABLE_EMOJIS.map((emoji) => {
    const reaction = reactions.find((r) => r.emoji === emoji);
    const count = (reaction == null ? void 0 : reaction.count) || 0;
    const userReacted = (reaction == null ? void 0 : reaction.userReacted) || false;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        variant: userReacted ? "secondary" : "outline",
        size: "sm",
        onClick: () => handleReaction(emoji),
        disabled: isLoading,
        className: `h-8 px-2 text-sm border-accent-purple/20 hover:border-accent-gold/50 ${userReacted ? "bg-accent-purple/20 text-accent-purple border-accent-purple/40" : "hover:bg-accent-gold/10"}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mr-1", children: emoji }),
          count > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: count })
        ]
      },
      emoji
    );
  }) });
};
function toDate(argument) {
  const argStr = Object.prototype.toString.call(argument);
  if (argument instanceof Date || typeof argument === "object" && argStr === "[object Date]") {
    return new argument.constructor(+argument);
  } else if (typeof argument === "number" || argStr === "[object Number]" || typeof argument === "string" || argStr === "[object String]") {
    return new Date(argument);
  } else {
    return /* @__PURE__ */ new Date(NaN);
  }
}
function constructFrom(date, value) {
  if (date instanceof Date) {
    return new date.constructor(value);
  } else {
    return new Date(value);
  }
}
const minutesInMonth = 43200;
const minutesInDay = 1440;
let defaultOptions = {};
function getDefaultOptions() {
  return defaultOptions;
}
function getTimezoneOffsetInMilliseconds(date) {
  const _date = toDate(date);
  const utcDate = new Date(
    Date.UTC(
      _date.getFullYear(),
      _date.getMonth(),
      _date.getDate(),
      _date.getHours(),
      _date.getMinutes(),
      _date.getSeconds(),
      _date.getMilliseconds()
    )
  );
  utcDate.setUTCFullYear(_date.getFullYear());
  return +date - +utcDate;
}
function compareAsc(dateLeft, dateRight) {
  const _dateLeft = toDate(dateLeft);
  const _dateRight = toDate(dateRight);
  const diff = _dateLeft.getTime() - _dateRight.getTime();
  if (diff < 0) {
    return -1;
  } else if (diff > 0) {
    return 1;
  } else {
    return diff;
  }
}
function constructNow(date) {
  return constructFrom(date, Date.now());
}
function differenceInCalendarMonths(dateLeft, dateRight) {
  const _dateLeft = toDate(dateLeft);
  const _dateRight = toDate(dateRight);
  const yearDiff = _dateLeft.getFullYear() - _dateRight.getFullYear();
  const monthDiff = _dateLeft.getMonth() - _dateRight.getMonth();
  return yearDiff * 12 + monthDiff;
}
function getRoundingMethod(method) {
  return (number) => {
    const round = method ? Math[method] : Math.trunc;
    const result = round(number);
    return result === 0 ? 0 : result;
  };
}
function differenceInMilliseconds(dateLeft, dateRight) {
  return +toDate(dateLeft) - +toDate(dateRight);
}
function endOfDay(date) {
  const _date = toDate(date);
  _date.setHours(23, 59, 59, 999);
  return _date;
}
function endOfMonth(date) {
  const _date = toDate(date);
  const month = _date.getMonth();
  _date.setFullYear(_date.getFullYear(), month + 1, 0);
  _date.setHours(23, 59, 59, 999);
  return _date;
}
function isLastDayOfMonth(date) {
  const _date = toDate(date);
  return +endOfDay(_date) === +endOfMonth(_date);
}
function differenceInMonths(dateLeft, dateRight) {
  const _dateLeft = toDate(dateLeft);
  const _dateRight = toDate(dateRight);
  const sign = compareAsc(_dateLeft, _dateRight);
  const difference = Math.abs(
    differenceInCalendarMonths(_dateLeft, _dateRight)
  );
  let result;
  if (difference < 1) {
    result = 0;
  } else {
    if (_dateLeft.getMonth() === 1 && _dateLeft.getDate() > 27) {
      _dateLeft.setDate(30);
    }
    _dateLeft.setMonth(_dateLeft.getMonth() - sign * difference);
    let isLastMonthNotFull = compareAsc(_dateLeft, _dateRight) === -sign;
    if (isLastDayOfMonth(toDate(dateLeft)) && difference === 1 && compareAsc(dateLeft, _dateRight) === 1) {
      isLastMonthNotFull = false;
    }
    result = sign * (difference - Number(isLastMonthNotFull));
  }
  return result === 0 ? 0 : result;
}
function differenceInSeconds(dateLeft, dateRight, options) {
  const diff = differenceInMilliseconds(dateLeft, dateRight) / 1e3;
  return getRoundingMethod(options == null ? void 0 : options.roundingMethod)(diff);
}
const formatDistanceLocale = {
  lessThanXSeconds: {
    one: "less than a second",
    other: "less than {{count}} seconds"
  },
  xSeconds: {
    one: "1 second",
    other: "{{count}} seconds"
  },
  halfAMinute: "half a minute",
  lessThanXMinutes: {
    one: "less than a minute",
    other: "less than {{count}} minutes"
  },
  xMinutes: {
    one: "1 minute",
    other: "{{count}} minutes"
  },
  aboutXHours: {
    one: "about 1 hour",
    other: "about {{count}} hours"
  },
  xHours: {
    one: "1 hour",
    other: "{{count}} hours"
  },
  xDays: {
    one: "1 day",
    other: "{{count}} days"
  },
  aboutXWeeks: {
    one: "about 1 week",
    other: "about {{count}} weeks"
  },
  xWeeks: {
    one: "1 week",
    other: "{{count}} weeks"
  },
  aboutXMonths: {
    one: "about 1 month",
    other: "about {{count}} months"
  },
  xMonths: {
    one: "1 month",
    other: "{{count}} months"
  },
  aboutXYears: {
    one: "about 1 year",
    other: "about {{count}} years"
  },
  xYears: {
    one: "1 year",
    other: "{{count}} years"
  },
  overXYears: {
    one: "over 1 year",
    other: "over {{count}} years"
  },
  almostXYears: {
    one: "almost 1 year",
    other: "almost {{count}} years"
  }
};
const formatDistance$1 = (token, count, options) => {
  let result;
  const tokenValue = formatDistanceLocale[token];
  if (typeof tokenValue === "string") {
    result = tokenValue;
  } else if (count === 1) {
    result = tokenValue.one;
  } else {
    result = tokenValue.other.replace("{{count}}", count.toString());
  }
  if (options == null ? void 0 : options.addSuffix) {
    if (options.comparison && options.comparison > 0) {
      return "in " + result;
    } else {
      return result + " ago";
    }
  }
  return result;
};
function buildFormatLongFn(args) {
  return (options = {}) => {
    const width = options.width ? String(options.width) : args.defaultWidth;
    const format = args.formats[width] || args.formats[args.defaultWidth];
    return format;
  };
}
const dateFormats = {
  full: "EEEE, MMMM do, y",
  long: "MMMM do, y",
  medium: "MMM d, y",
  short: "MM/dd/yyyy"
};
const timeFormats = {
  full: "h:mm:ss a zzzz",
  long: "h:mm:ss a z",
  medium: "h:mm:ss a",
  short: "h:mm a"
};
const dateTimeFormats = {
  full: "{{date}} 'at' {{time}}",
  long: "{{date}} 'at' {{time}}",
  medium: "{{date}}, {{time}}",
  short: "{{date}}, {{time}}"
};
const formatLong = {
  date: buildFormatLongFn({
    formats: dateFormats,
    defaultWidth: "full"
  }),
  time: buildFormatLongFn({
    formats: timeFormats,
    defaultWidth: "full"
  }),
  dateTime: buildFormatLongFn({
    formats: dateTimeFormats,
    defaultWidth: "full"
  })
};
const formatRelativeLocale = {
  lastWeek: "'last' eeee 'at' p",
  yesterday: "'yesterday at' p",
  today: "'today at' p",
  tomorrow: "'tomorrow at' p",
  nextWeek: "eeee 'at' p",
  other: "P"
};
const formatRelative = (token, _date, _baseDate, _options) => formatRelativeLocale[token];
function buildLocalizeFn(args) {
  return (value, options) => {
    const context = (options == null ? void 0 : options.context) ? String(options.context) : "standalone";
    let valuesArray;
    if (context === "formatting" && args.formattingValues) {
      const defaultWidth = args.defaultFormattingWidth || args.defaultWidth;
      const width = (options == null ? void 0 : options.width) ? String(options.width) : defaultWidth;
      valuesArray = args.formattingValues[width] || args.formattingValues[defaultWidth];
    } else {
      const defaultWidth = args.defaultWidth;
      const width = (options == null ? void 0 : options.width) ? String(options.width) : args.defaultWidth;
      valuesArray = args.values[width] || args.values[defaultWidth];
    }
    const index = args.argumentCallback ? args.argumentCallback(value) : value;
    return valuesArray[index];
  };
}
const eraValues = {
  narrow: ["B", "A"],
  abbreviated: ["BC", "AD"],
  wide: ["Before Christ", "Anno Domini"]
};
const quarterValues = {
  narrow: ["1", "2", "3", "4"],
  abbreviated: ["Q1", "Q2", "Q3", "Q4"],
  wide: ["1st quarter", "2nd quarter", "3rd quarter", "4th quarter"]
};
const monthValues = {
  narrow: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
  abbreviated: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ],
  wide: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ]
};
const dayValues = {
  narrow: ["S", "M", "T", "W", "T", "F", "S"],
  short: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
  abbreviated: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  wide: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ]
};
const dayPeriodValues = {
  narrow: {
    am: "a",
    pm: "p",
    midnight: "mi",
    noon: "n",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night"
  },
  abbreviated: {
    am: "AM",
    pm: "PM",
    midnight: "midnight",
    noon: "noon",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night"
  },
  wide: {
    am: "a.m.",
    pm: "p.m.",
    midnight: "midnight",
    noon: "noon",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night"
  }
};
const formattingDayPeriodValues = {
  narrow: {
    am: "a",
    pm: "p",
    midnight: "mi",
    noon: "n",
    morning: "in the morning",
    afternoon: "in the afternoon",
    evening: "in the evening",
    night: "at night"
  },
  abbreviated: {
    am: "AM",
    pm: "PM",
    midnight: "midnight",
    noon: "noon",
    morning: "in the morning",
    afternoon: "in the afternoon",
    evening: "in the evening",
    night: "at night"
  },
  wide: {
    am: "a.m.",
    pm: "p.m.",
    midnight: "midnight",
    noon: "noon",
    morning: "in the morning",
    afternoon: "in the afternoon",
    evening: "in the evening",
    night: "at night"
  }
};
const ordinalNumber = (dirtyNumber, _options) => {
  const number = Number(dirtyNumber);
  const rem100 = number % 100;
  if (rem100 > 20 || rem100 < 10) {
    switch (rem100 % 10) {
      case 1:
        return number + "st";
      case 2:
        return number + "nd";
      case 3:
        return number + "rd";
    }
  }
  return number + "th";
};
const localize = {
  ordinalNumber,
  era: buildLocalizeFn({
    values: eraValues,
    defaultWidth: "wide"
  }),
  quarter: buildLocalizeFn({
    values: quarterValues,
    defaultWidth: "wide",
    argumentCallback: (quarter) => quarter - 1
  }),
  month: buildLocalizeFn({
    values: monthValues,
    defaultWidth: "wide"
  }),
  day: buildLocalizeFn({
    values: dayValues,
    defaultWidth: "wide"
  }),
  dayPeriod: buildLocalizeFn({
    values: dayPeriodValues,
    defaultWidth: "wide",
    formattingValues: formattingDayPeriodValues,
    defaultFormattingWidth: "wide"
  })
};
function buildMatchFn(args) {
  return (string, options = {}) => {
    const width = options.width;
    const matchPattern = width && args.matchPatterns[width] || args.matchPatterns[args.defaultMatchWidth];
    const matchResult = string.match(matchPattern);
    if (!matchResult) {
      return null;
    }
    const matchedString = matchResult[0];
    const parsePatterns = width && args.parsePatterns[width] || args.parsePatterns[args.defaultParseWidth];
    const key = Array.isArray(parsePatterns) ? findIndex(parsePatterns, (pattern) => pattern.test(matchedString)) : (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- I challange you to fix the type
      findKey(parsePatterns, (pattern) => pattern.test(matchedString))
    );
    let value;
    value = args.valueCallback ? args.valueCallback(key) : key;
    value = options.valueCallback ? (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- I challange you to fix the type
      options.valueCallback(value)
    ) : value;
    const rest = string.slice(matchedString.length);
    return { value, rest };
  };
}
function findKey(object, predicate) {
  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key) && predicate(object[key])) {
      return key;
    }
  }
  return void 0;
}
function findIndex(array, predicate) {
  for (let key = 0; key < array.length; key++) {
    if (predicate(array[key])) {
      return key;
    }
  }
  return void 0;
}
function buildMatchPatternFn(args) {
  return (string, options = {}) => {
    const matchResult = string.match(args.matchPattern);
    if (!matchResult) return null;
    const matchedString = matchResult[0];
    const parseResult = string.match(args.parsePattern);
    if (!parseResult) return null;
    let value = args.valueCallback ? args.valueCallback(parseResult[0]) : parseResult[0];
    value = options.valueCallback ? options.valueCallback(value) : value;
    const rest = string.slice(matchedString.length);
    return { value, rest };
  };
}
const matchOrdinalNumberPattern = /^(\d+)(th|st|nd|rd)?/i;
const parseOrdinalNumberPattern = /\d+/i;
const matchEraPatterns = {
  narrow: /^(b|a)/i,
  abbreviated: /^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,
  wide: /^(before christ|before common era|anno domini|common era)/i
};
const parseEraPatterns = {
  any: [/^b/i, /^(a|c)/i]
};
const matchQuarterPatterns = {
  narrow: /^[1234]/i,
  abbreviated: /^q[1234]/i,
  wide: /^[1234](th|st|nd|rd)? quarter/i
};
const parseQuarterPatterns = {
  any: [/1/i, /2/i, /3/i, /4/i]
};
const matchMonthPatterns = {
  narrow: /^[jfmasond]/i,
  abbreviated: /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
  wide: /^(january|february|march|april|may|june|july|august|september|october|november|december)/i
};
const parseMonthPatterns = {
  narrow: [
    /^j/i,
    /^f/i,
    /^m/i,
    /^a/i,
    /^m/i,
    /^j/i,
    /^j/i,
    /^a/i,
    /^s/i,
    /^o/i,
    /^n/i,
    /^d/i
  ],
  any: [
    /^ja/i,
    /^f/i,
    /^mar/i,
    /^ap/i,
    /^may/i,
    /^jun/i,
    /^jul/i,
    /^au/i,
    /^s/i,
    /^o/i,
    /^n/i,
    /^d/i
  ]
};
const matchDayPatterns = {
  narrow: /^[smtwf]/i,
  short: /^(su|mo|tu|we|th|fr|sa)/i,
  abbreviated: /^(sun|mon|tue|wed|thu|fri|sat)/i,
  wide: /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i
};
const parseDayPatterns = {
  narrow: [/^s/i, /^m/i, /^t/i, /^w/i, /^t/i, /^f/i, /^s/i],
  any: [/^su/i, /^m/i, /^tu/i, /^w/i, /^th/i, /^f/i, /^sa/i]
};
const matchDayPeriodPatterns = {
  narrow: /^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,
  any: /^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i
};
const parseDayPeriodPatterns = {
  any: {
    am: /^a/i,
    pm: /^p/i,
    midnight: /^mi/i,
    noon: /^no/i,
    morning: /morning/i,
    afternoon: /afternoon/i,
    evening: /evening/i,
    night: /night/i
  }
};
const match = {
  ordinalNumber: buildMatchPatternFn({
    matchPattern: matchOrdinalNumberPattern,
    parsePattern: parseOrdinalNumberPattern,
    valueCallback: (value) => parseInt(value, 10)
  }),
  era: buildMatchFn({
    matchPatterns: matchEraPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseEraPatterns,
    defaultParseWidth: "any"
  }),
  quarter: buildMatchFn({
    matchPatterns: matchQuarterPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseQuarterPatterns,
    defaultParseWidth: "any",
    valueCallback: (index) => index + 1
  }),
  month: buildMatchFn({
    matchPatterns: matchMonthPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseMonthPatterns,
    defaultParseWidth: "any"
  }),
  day: buildMatchFn({
    matchPatterns: matchDayPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseDayPatterns,
    defaultParseWidth: "any"
  }),
  dayPeriod: buildMatchFn({
    matchPatterns: matchDayPeriodPatterns,
    defaultMatchWidth: "any",
    parsePatterns: parseDayPeriodPatterns,
    defaultParseWidth: "any"
  })
};
const enUS = {
  code: "en-US",
  formatDistance: formatDistance$1,
  formatLong,
  formatRelative,
  localize,
  match,
  options: {
    weekStartsOn: 0,
    firstWeekContainsDate: 1
  }
};
function formatDistance(date, baseDate, options) {
  const defaultOptions2 = getDefaultOptions();
  const locale = (options == null ? void 0 : options.locale) ?? defaultOptions2.locale ?? enUS;
  const minutesInAlmostTwoDays = 2520;
  const comparison = compareAsc(date, baseDate);
  if (isNaN(comparison)) {
    throw new RangeError("Invalid time value");
  }
  const localizeOptions = Object.assign({}, options, {
    addSuffix: options == null ? void 0 : options.addSuffix,
    comparison
  });
  let dateLeft;
  let dateRight;
  if (comparison > 0) {
    dateLeft = toDate(baseDate);
    dateRight = toDate(date);
  } else {
    dateLeft = toDate(date);
    dateRight = toDate(baseDate);
  }
  const seconds = differenceInSeconds(dateRight, dateLeft);
  const offsetInSeconds = (getTimezoneOffsetInMilliseconds(dateRight) - getTimezoneOffsetInMilliseconds(dateLeft)) / 1e3;
  const minutes = Math.round((seconds - offsetInSeconds) / 60);
  let months;
  if (minutes < 2) {
    if (options == null ? void 0 : options.includeSeconds) {
      if (seconds < 5) {
        return locale.formatDistance("lessThanXSeconds", 5, localizeOptions);
      } else if (seconds < 10) {
        return locale.formatDistance("lessThanXSeconds", 10, localizeOptions);
      } else if (seconds < 20) {
        return locale.formatDistance("lessThanXSeconds", 20, localizeOptions);
      } else if (seconds < 40) {
        return locale.formatDistance("halfAMinute", 0, localizeOptions);
      } else if (seconds < 60) {
        return locale.formatDistance("lessThanXMinutes", 1, localizeOptions);
      } else {
        return locale.formatDistance("xMinutes", 1, localizeOptions);
      }
    } else {
      if (minutes === 0) {
        return locale.formatDistance("lessThanXMinutes", 1, localizeOptions);
      } else {
        return locale.formatDistance("xMinutes", minutes, localizeOptions);
      }
    }
  } else if (minutes < 45) {
    return locale.formatDistance("xMinutes", minutes, localizeOptions);
  } else if (minutes < 90) {
    return locale.formatDistance("aboutXHours", 1, localizeOptions);
  } else if (minutes < minutesInDay) {
    const hours = Math.round(minutes / 60);
    return locale.formatDistance("aboutXHours", hours, localizeOptions);
  } else if (minutes < minutesInAlmostTwoDays) {
    return locale.formatDistance("xDays", 1, localizeOptions);
  } else if (minutes < minutesInMonth) {
    const days = Math.round(minutes / minutesInDay);
    return locale.formatDistance("xDays", days, localizeOptions);
  } else if (minutes < minutesInMonth * 2) {
    months = Math.round(minutes / minutesInMonth);
    return locale.formatDistance("aboutXMonths", months, localizeOptions);
  }
  months = differenceInMonths(dateRight, dateLeft);
  if (months < 12) {
    const nearestMonth = Math.round(minutes / minutesInMonth);
    return locale.formatDistance("xMonths", nearestMonth, localizeOptions);
  } else {
    const monthsSinceStartOfYear = months % 12;
    const years = Math.trunc(months / 12);
    if (monthsSinceStartOfYear < 3) {
      return locale.formatDistance("aboutXYears", years, localizeOptions);
    } else if (monthsSinceStartOfYear < 9) {
      return locale.formatDistance("overXYears", years, localizeOptions);
    } else {
      return locale.formatDistance("almostXYears", years + 1, localizeOptions);
    }
  }
}
function formatDistanceToNow(date, options) {
  return formatDistance(date, constructNow(date), options);
}
const GuestbookPost = ({ post, onUpdate }) => {
  const [showReplyForm, setShowReplyForm] = reactExports.useState(false);
  const [isEditing, setIsEditing] = reactExports.useState(false);
  const [editMessage, setEditMessage] = reactExports.useState(post.message);
  const [replies, setReplies] = reactExports.useState([]);
  const [showReplies, setShowReplies] = reactExports.useState(false);
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const isOwner = (user == null ? void 0 : user.id) === post.user_id;
  reactExports.useEffect(() => {
    loadReplies();
  }, [post.id]);
  const loadReplies = async () => {
    const { data, error } = await supabase.from("guestbook_replies").select("*").eq("post_id", post.id).order("created_at", { ascending: true });
    if (!error && data) {
      setReplies(data);
    }
  };
  const handleEdit = async () => {
    if (!editMessage.trim() || editMessage === post.message) {
      setIsEditing(false);
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.from("guestbook").update({
        message: editMessage.trim(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", post.id);
      if (error) throw error;
      toast({ title: "Message updated!" });
      setIsEditing(false);
      onUpdate == null ? void 0 : onUpdate();
    } catch (error) {
      toast({ title: "Failed to update message", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.from("guestbook").update({ deleted_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", post.id);
      if (error) throw error;
      toast({ title: "Message deleted" });
      onUpdate == null ? void 0 : onUpdate();
    } catch (error) {
      toast({ title: "Failed to delete message", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  const handleReport = async () => {
    const reason = prompt("Please describe why you are reporting this message (optional):");
    if (reason === null) return;
    try {
      const { error } = await supabase.from("guestbook_reports").insert({
        post_id: post.id,
        reporter_id: user == null ? void 0 : user.id,
        reason: (reason == null ? void 0 : reason.trim()) || null
      });
      if (error) throw error;
      toast({ title: "Message reported", description: "Thank you for helping keep our community safe." });
    } catch (error) {
      toast({ title: "Failed to report message", variant: "destructive" });
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card p-6 rounded-lg border border-accent-purple/30 hover:border-accent-gold/50 transition-colors", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-subhead text-lg text-accent-purple", children: post.is_anonymous ? "Anonymous Guest" : post.display_name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-body text-xs text-muted-foreground", children: [
          formatDistanceToNow(new Date(post.created_at), { addSuffix: true }),
          post.updated_at && post.updated_at !== post.created_at && " (edited)"
        ] })
      ] }),
      user && /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Ellipsis, { className: "h-4 w-4" }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", children: [
          isOwner && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => setIsEditing(true), className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SquarePen, { className: "h-4 w-4" }),
              "Edit"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              DropdownMenuItem,
              {
                onClick: handleDelete,
                className: "flex items-center gap-2 text-destructive",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }),
                  "Delete"
                ]
              }
            )
          ] }),
          !isOwner && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            DropdownMenuItem,
            {
              onClick: handleReport,
              className: "flex items-center gap-2",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { className: "h-4 w-4" }),
                "Report"
              ]
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4", children: isEditing ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "textarea",
        {
          value: editMessage,
          onChange: (e) => setEditMessage(e.target.value),
          className: "w-full p-3 bg-bg-2 border border-accent-purple/20 rounded-md font-body text-muted-foreground resize-none focus:outline-none focus:border-accent-gold",
          rows: 4,
          maxLength: 2e3
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: handleEdit,
            disabled: isLoading,
            size: "sm",
            className: "bg-accent-red hover:bg-accent-red/80",
            children: "Save"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: () => {
              setIsEditing(false);
              setEditMessage(post.message);
            },
            variant: "outline",
            size: "sm",
            children: "Cancel"
          }
        )
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-body text-muted-foreground whitespace-pre-wrap", children: [
      '"',
      post.message,
      '"'
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(EmojiReactions, { postId: post.id }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 text-sm", children: user && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "ghost",
            size: "sm",
            onClick: () => setShowReplyForm(!showReplyForm),
            className: "text-accent-gold hover:bg-accent-gold/10",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-4 w-4 mr-1" }),
              "Reply"
            ]
          }
        ),
        replies.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "ghost",
            size: "sm",
            onClick: () => setShowReplies(!showReplies),
            className: "text-muted-foreground hover:text-accent-purple",
            children: [
              showReplies ? "Hide" : "Show",
              " ",
              replies.length,
              " ",
              replies.length === 1 ? "reply" : "replies"
            ]
          }
        )
      ] }) }),
      showReplyForm && /* @__PURE__ */ jsxRuntimeExports.jsx(
        MessageComposer,
        {
          isReply: true,
          postId: post.id,
          onCancel: () => setShowReplyForm(false),
          onMessagePosted: () => {
            setShowReplyForm(false);
            loadReplies();
          }
        }
      ),
      showReplies && replies.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-8 space-y-3 border-l border-accent-purple/20 pl-4", children: replies.map((reply) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-bg-2 p-4 rounded-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-between items-start mb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-subhead text-sm text-accent-purple", children: reply.is_anonymous ? "Anonymous Guest" : reply.display_name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-xs text-muted-foreground", children: formatDistanceToNow(new Date(reply.created_at), { addSuffix: true }) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-sm text-muted-foreground whitespace-pre-wrap", children: reply.message })
      ] }, reply.id)) })
    ] })
  ] });
};
const Discussion = () => {
  const [posts, setPosts] = reactExports.useState([]);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [loadingMore, setLoadingMore] = reactExports.useState(false);
  const [hasMore, setHasMore] = reactExports.useState(true);
  const [showAuthModal, setShowAuthModal] = reactExports.useState(false);
  const { user, loading } = useAuth();
  const PAGE_SIZE = 25;
  reactExports.useEffect(() => {
    loadPosts();
  }, [user]);
  reactExports.useEffect(() => {
    const channel = supabase.channel("guestbook-changes").on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "guestbook"
      },
      (payload) => {
        const newPost = payload.new;
        setPosts((prevPosts) => [newPost, ...prevPosts]);
      }
    ).on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "guestbook"
      },
      (payload) => {
        const updatedPost = payload.new;
        if (updatedPost.deleted_at) {
          setPosts((prevPosts) => prevPosts.filter((post) => post.id !== updatedPost.id));
        } else {
          setPosts(
            (prevPosts) => prevPosts.map(
              (post) => post.id === updatedPost.id ? updatedPost : post
            )
          );
        }
      }
    ).subscribe();
    return () => {
      channel.unsubscribe();
    };
  }, []);
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-background flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-heading text-2xl mb-4", children: "Loading..." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-body text-muted-foreground", children: "Checking authentication status" })
    ] }) });
  }
  const loadPosts = async (reset = true) => {
    setIsLoading(reset);
    try {
      const { data, error } = await supabase.from("guestbook").select("*").is("deleted_at", null).order("created_at", { ascending: false }).range(reset ? 0 : posts.length, reset ? PAGE_SIZE - 1 : posts.length + PAGE_SIZE - 1);
      if (error) throw error;
      if (data) {
        if (reset) {
          setPosts(data);
        } else {
          setPosts((prev) => [...prev, ...data]);
        }
        setHasMore(data.length === PAGE_SIZE);
      }
    } catch (error) {
      console.error("Failed to load posts:", error);
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  };
  const loadMorePosts = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    await loadPosts(false);
  };
  const handleMessagePosted = () => {
    loadPosts(true);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(NavBar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "pt-20", children: /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "py-16 px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto max-w-4xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-heading text-4xl md:text-6xl text-shadow-gothic", children: "The Dark Guestbook" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          HuntHintTrigger,
          {
            id: "guestbook-hint",
            label: "Hidden Message",
            hint: "Look for messages that reveal more than they say..."
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-lg text-center mb-12 text-muted-foreground max-w-3xl mx-auto", children: "Share your thoughts, theories, and twisted tales. What darkness will you bring to this year's celebration? Join the conversation..." }),
      !user ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center mb-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card p-8 rounded-lg border border-accent-purple/30 max-w-2xl mx-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-heading text-5xl mb-4 text-accent-gold", children: "📖" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-subhead text-2xl mb-4 text-accent-red", children: "Sign In to Share Your Tale" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-muted-foreground mb-6", children: "Ready to add your voice to the guestbook? Sign in to share your twisted tales, theories, and connect with fellow adventurers." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: () => setShowAuthModal(true),
            className: "bg-accent-red hover:bg-accent-red/80 glow-gold font-subhead px-8 py-3",
            children: "Sign In to Post"
          }
        )
      ] }) }) : (
        /* Message Composer for authenticated users */
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageComposer, { onMessagePosted: handleMessagePosted }) })
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: isLoading && posts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Loader, { className: "h-8 w-8 animate-spin mx-auto mb-4 text-accent-gold" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-muted-foreground", children: "Loading messages..." })
      ] }) : posts.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        posts.map((post) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          GuestbookPost,
          {
            post,
            onUpdate: () => loadPosts(true)
          },
          post.id
        )),
        hasMore && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: loadMorePosts,
            disabled: loadingMore,
            variant: "outline",
            className: "border-accent-purple/30 hover:bg-accent-purple/10",
            children: loadingMore ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Loader, { className: "h-4 w-4 animate-spin mr-2" }),
              "Loading..."
            ] }) : "Load More Messages"
          }
        ) })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-heading text-6xl mb-4 text-accent-gold opacity-50", children: "👻" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-subhead text-xl mb-2 text-muted-foreground", children: "No messages yet..." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-muted-foreground", children: user ? "Be the first to write in the Dark Guestbook." : "Sign in to see and share twisted tales." })
      ] }) })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {}),
    showAuthModal && /* @__PURE__ */ jsxRuntimeExports.jsx(
      AuthModal,
      {
        isOpen: showAuthModal,
        onClose: () => setShowAuthModal(false)
      }
    )
  ] });
};
export {
  Discussion as default
};
//# sourceMappingURL=Discussion-CXWGc24Y.js.map
