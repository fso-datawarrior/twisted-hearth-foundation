import { Link } from "react-router-dom";
import { Crown, CalendarClock, Wine, BookText } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

type Tile = {
  to: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  accent: "purple" | "green" | "gold" | "red";
  hintKey: string;
  testId: string;
};

const tiles: Tile[] = [
  {
    to: "/costumes",
    title: "Costume Ideas",
    subtitle: "Twist a tale—no spoilers, all style.",
    icon: Crown,
    accent: "purple",
    hintKey: "prep.costumes",
    testId: "prep-costumes",
  },
  {
    to: "/schedule",
    title: "Event Schedule",
    subtitle: "When the clock strikes fun.",
    icon: CalendarClock,
    accent: "green",
    hintKey: "prep.schedule",
    testId: "prep-schedule",
  },
  {
    to: "/feast",
    title: "Feast Details",
    subtitle: "Bring a dish with a dark theme.",
    icon: Wine,
    accent: "gold",
    hintKey: "prep.feast",
    testId: "prep-feast",
  },
  {
    to: "/vignettes",
    title: "Past Stories",
    subtitle: "Peek at twisted echoes from years past.",
    icon: BookText,
    accent: "red",
    hintKey: "prep.vignettes",
    testId: "prep-stories",
  },
];

function accentClasses(accent: Tile["accent"]) {
  const map = {
    purple: "border-[color:var(--accent-purple)] shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)]",
    green:  "border-[color:var(--accent-green)] shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]",
    gold:   "border-[color:var(--accent-gold)] shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:shadow-[0_0_30px_rgba(234,179,8,0.6)]",
    red:    "border-[color:var(--accent-red)] shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)]",
  } as const;
  return map[accent];
}

export default function PrepLinks() {
  const reduce = useReducedMotion();
  return (
    <section className="mb-16" aria-label="Quick navigation">
      <nav aria-labelledby="prep-heading" className="bg-[color:var(--bg-2)]/85 rounded-2xl border border-[color:var(--accent-purple)]/30 p-6 sm:p-8 backdrop-blur">
        <h2 id="prep-heading" className="font-subhead text-2xl sm:text-3xl text-center mb-6 sm:mb-8 text-[color:var(--accent-gold)] tracking-tight">
          Prepare for Your Twisted Tale
        </h2>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {tiles.map(({ to, title, subtitle, icon: Icon, accent, hintKey, testId }) => {
            const MotionDiv = reduce ? "div" : motion.div;
            return (
              <MotionDiv
                key={title}
                initial={reduce ? undefined : { opacity: 0, y: 12 }}
                whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
              >
                <Link
                  to={to}
                  data-testid={testId}
                  data-hint-key={hintKey}
                  aria-describedby={`${testId}-sub`}
                  className={[
                    "group relative block h-full rounded-xl border-2",
                    accentClasses(accent),
                    // vibrant glass panel with colored inner glow
                    "bg-gradient-to-br from-black/60 via-black/40 to-black/60",
                    "px-6 py-6 md:px-7 md:py-7",
                    "text-[color:var(--ink)]",
                    // focus ring
                    "outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                    "focus-visible:ring-[color:var(--accent-gold)] focus-visible:ring-offset-[color:var(--bg)]",
                    // enhanced shadow with colored glow
                    "shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
                    "before:absolute before:inset-0 before:rounded-xl before:pointer-events-none",
                    "before:bg-gradient-to-br before:from-white/5 before:via-transparent before:to-white/2",
                    "after:absolute after:inset-0 after:rounded-xl after:pointer-events-none",
                    "after:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),inset_0_0_40px_rgba(197,164,93,0.15)]",
                    // transitions with more excitement
                    "transition-all duration-300 ease-out will-change-transform",
                    "hover:scale-105 hover:-translate-y-1",
                    "active:scale-95"
                  ].join(" ")}
                >
                  {reduce ? (
                    <div className="flex items-start gap-4">
                      <span className={`flex h-12 w-12 items-center justify-center rounded-full border-2 bg-gradient-to-br from-black/50 to-black/30 shadow-lg flex-shrink-0 ${
                        accent === 'purple' ? 'border-purple-400 shadow-purple-500/30' :
                        accent === 'green' ? 'border-green-400 shadow-green-500/30' :
                        accent === 'gold' ? 'border-yellow-400 shadow-yellow-500/40' :
                        'border-red-400 shadow-red-500/30'
                      }`}>
                        <Icon className={`h-5 w-5 ${
                          accent === 'purple' ? 'text-purple-300' :
                          accent === 'green' ? 'text-green-300' :
                          accent === 'gold' ? 'text-yellow-300' :
                          'text-red-300'
                        }`} aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-subhead text-xl text-[color:var(--accent-gold)] tracking-tight drop-shadow-lg">
                          {title}
                        </h3>
                        <p id={`${testId}-sub`} className="text-sm/5 opacity-90 text-white/90">
                          {subtitle}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <motion.div
                      whileHover={{ scale: 1.05, rotateX: 3, rotateY: -3, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-start gap-4"
                    >
                      <motion.span 
                        className={`flex h-12 w-12 items-center justify-center rounded-full border-2 bg-gradient-to-br from-black/50 to-black/30 shadow-lg transition-all duration-300 flex-shrink-0 ${
                          accent === 'purple' ? 'border-purple-400 shadow-purple-500/30 group-hover:shadow-purple-500/50 group-hover:border-purple-300' :
                          accent === 'green' ? 'border-green-400 shadow-green-500/30 group-hover:shadow-green-500/50 group-hover:border-green-300' :
                          accent === 'gold' ? 'border-yellow-400 shadow-yellow-500/40 group-hover:shadow-yellow-500/60 group-hover:border-yellow-300' :
                          'border-red-400 shadow-red-500/30 group-hover:shadow-red-500/50 group-hover:border-red-300'
                        }`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Icon className={`h-5 w-5 transition-colors duration-300 ${
                          accent === 'purple' ? 'text-purple-300 group-hover:text-purple-200' :
                          accent === 'green' ? 'text-green-300 group-hover:text-green-200' :
                          accent === 'gold' ? 'text-yellow-300 group-hover:text-yellow-200' :
                          'text-red-300 group-hover:text-red-200'
                        }`} aria-hidden="true" />
                      </motion.span>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-subhead text-xl text-[color:var(--accent-gold)] tracking-tight drop-shadow-lg group-hover:text-yellow-300 transition-colors duration-300">
                          {title}
                        </h3>
                        <p id={`${testId}-sub`} className="text-sm/5 opacity-90 text-white/90 group-hover:text-white transition-colors duration-300">
                          {subtitle}
                        </p>
                      </div>
                      <motion.span 
                        className="ml-auto text-xs opacity-0 group-focus-visible:opacity-100 group-hover:opacity-100 transition-opacity duration-300 text-yellow-400 flex-shrink-0" 
                        aria-hidden="true"
                        whileHover={{ scale: 1.2, rotate: 15 }}
                      >
                        ✧
                      </motion.span>
                    </motion.div>
                  )}
                </Link>
              </MotionDiv>
            );
          })}
        </div>
      </nav>
    </section>
  );
}
