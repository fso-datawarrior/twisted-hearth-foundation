import { motion, useReducedMotion } from "framer-motion";

// The SVG for the ornate mirror frame with baroque styling
const MagicMirrorSVG = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 160" xmlns="http://www.w3.org/2000/svg">
    <defs>
      {/* Ornate gold frame gradient */}
      <linearGradient id="ornateGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700"/>
        <stop offset="25%" stopColor="#FFA500"/>
        <stop offset="50%" stopColor="#DAA520"/>
        <stop offset="75%" stopColor="#FF8C00"/>
        <stop offset="100%" stopColor="#B8860B"/>
      </linearGradient>
      
      {/* Darker gold for shadows */}
      <linearGradient id="darkGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#B8860B"/>
        <stop offset="50%" stopColor="#8B6914"/>
        <stop offset="100%" stopColor="#6B4E00"/>
      </linearGradient>
      
      {/* Dark mirror surface */}
      <linearGradient id="mirrorSurface" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2A1A3A"/>
        <stop offset="30%" stopColor="#1A0F2E"/>
        <stop offset="60%" stopColor="#0F0A1A"/>
        <stop offset="100%" stopColor="#0A050F"/>
      </linearGradient>
      
      {/* Main reflection highlight - more dynamic */}
      <radialGradient id="reflection" cx="35%" cy="20%" r="60%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8"/>
        <stop offset="30%" stopColor="#FFFFFF" stopOpacity="0.4"/>
        <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.1"/>
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0"/>
      </radialGradient>
      
      {/* Secondary reflection for depth */}
      <radialGradient id="reflection2" cx="70%" cy="60%" r="40%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.3"/>
        <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.1"/>
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0"/>
      </radialGradient>
      
      {/* Fluid wave-like reflection */}
      <linearGradient id="fluidReflection" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0"/>
        <stop offset="20%" stopColor="#FFFFFF" stopOpacity="0.2"/>
        <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.4"/>
        <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.2"/>
        <stop offset="80%" stopColor="#FFFFFF" stopOpacity="0.1"/>
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0"/>
      </linearGradient>
      
      {/* Central liquid mercury effect */}
      <linearGradient id="mercuryCenter" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9"/>
        <stop offset="15%" stopColor="#F8F8F8" stopOpacity="0.8"/>
        <stop offset="30%" stopColor="#E8E8E8" stopOpacity="0.6"/>
        <stop offset="50%" stopColor="#D0D0D0" stopOpacity="0.4"/>
        <stop offset="70%" stopColor="#B8B8B8" stopOpacity="0.3"/>
        <stop offset="85%" stopColor="#A0A0A0" stopOpacity="0.2"/>
        <stop offset="100%" stopColor="#888888" stopOpacity="0.1"/>
      </linearGradient>
      
      {/* Flowing liquid highlight */}
      <linearGradient id="liquidFlow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0"/>
        <stop offset="25%" stopColor="#FFFFFF" stopOpacity="0.3"/>
        <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.7"/>
        <stop offset="75%" stopColor="#FFFFFF" stopOpacity="0.3"/>
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0"/>
      </linearGradient>
    </defs>

    {/* Top ornate crown/crest */}
    <g fill="url(#ornateGold)" stroke="url(#darkGold)" strokeWidth="0.5">
      {/* Central crown element */}
      <path d="M50 5 C45 8, 40 12, 38 18 C42 15, 48 12, 50 10 C52 12, 58 15, 62 18 C60 12, 55 8, 50 5 Z"/>
      
      {/* Left ornamental flourish */}
      <path d="M38 18 C35 20, 32 25, 30 30 C28 28, 25 25, 22 22 C20 25, 18 30, 15 35 C20 32, 25 28, 30 30 C35 25, 38 20, 38 18 Z"/>
      
      {/* Right ornamental flourish */}
      <path d="M62 18 C65 20, 68 25, 70 30 C72 28, 75 25, 78 22 C80 25, 82 30, 85 35 C80 32, 75 28, 70 30 C65 25, 62 20, 62 18 Z"/>
      
      {/* Central decorative drop */}
      <ellipse cx="50" cy="25" rx="3" ry="8"/>
    </g>

    {/* Main ornate frame with baroque curves */}
    <path d="M50 35
             C30 35, 15 40, 10 50
             C8 45, 5 42, 2 45
             C5 50, 8 55, 10 50
             C10 65, 12 80, 15 95
             C12 100, 8 105, 5 110
             C8 115, 12 112, 15 110
             C15 125, 20 140, 35 145
             C40 148, 45 150, 50 150
             C55 150, 60 148, 65 145
             C80 140, 85 125, 85 110
             C88 112, 92 115, 95 110
             C92 105, 88 100, 85 95
             C88 80, 90 65, 90 50
             C92 55, 95 50, 98 45
             C95 42, 92 45, 90 50
             C85 40, 70 35, 50 35 Z"
          fill="url(#ornateGold)" 
          stroke="url(#darkGold)" 
          strokeWidth="1"/>

    {/* Left side ornamental scrollwork */}
    <g fill="url(#ornateGold)" stroke="url(#darkGold)" strokeWidth="0.3">
      <path d="M15 60 C12 58, 8 60, 6 65 C8 68, 12 66, 15 65 C18 68, 20 72, 15 75 C12 72, 8 75, 10 80 C15 78, 18 75, 20 72 C22 75, 25 78, 20 82 C15 80, 12 85, 15 88 C20 85, 25 82, 22 78 C25 75, 22 72, 20 70 C25 68, 22 65, 20 62 C18 65, 15 62, 15 60 Z"/>
    </g>

    {/* Right side ornamental scrollwork */}
    <g fill="url(#ornateGold)" stroke="url(#darkGold)" strokeWidth="0.3">
      <path d="M85 60 C88 58, 92 60, 94 65 C92 68, 88 66, 85 65 C82 68, 80 72, 85 75 C88 72, 92 75, 90 80 C85 78, 82 75, 80 72 C78 75, 75 78, 80 82 C85 80, 88 85, 85 88 C80 85, 75 82, 78 78 C75 75, 78 72, 80 70 C75 68, 78 65, 80 62 C82 65, 85 62, 85 60 Z"/>
    </g>

    {/* Bottom ornamental elements */}
    <g fill="url(#ornateGold)" stroke="url(#darkGold)" strokeWidth="0.4">
      {/* Left bottom flourish */}
      <path d="M25 135 C22 138, 18 142, 20 145 C25 142, 30 138, 28 135 C32 132, 35 128, 30 125 C25 128, 22 132, 25 135 Z"/>
      
      {/* Right bottom flourish */}
      <path d="M75 135 C78 138, 82 142, 80 145 C75 142, 70 138, 72 135 C68 132, 65 128, 70 125 C75 128, 78 132, 75 135 Z"/>
      
      {/* Central bottom ornament */}
      <ellipse cx="50" cy="140" rx="8" ry="4"/>
    </g>

    {/* Mirror surface (oval shape) - larger glass, less frame */}
    <ellipse cx="50" cy="85" rx="38" ry="52"
             fill="url(#mirrorSurface)"
             stroke="#1A0A2A"
             strokeWidth="0.5"/>

    {/* Liquid mercury center reflection */}
    <ellipse cx="50" cy="85" rx="35" ry="48" fill="url(#mercuryCenter)"/>
    <ellipse cx="50" cy="85" rx="33" ry="46" fill="url(#liquidFlow)"/>
    <rect x="49" y="40" width="2" height="90" fill="url(#centerStreak)"/>
  </svg>
);

type Props = { onOpen: () => void; className?: string; };

export function NavTrigger({ onOpen, className }: Props) {
  const prefersReduced = useReducedMotion();

  // Debug positioning
  console.log('NavTrigger rendered with positioning:', {
    position: 'fixed',
    right: '24px',
    top: '24px',
    zIndex: 100
  });

  return (
    <div
      style={{
        position: 'fixed',
        right: '16px',
        top: '16px',
        zIndex: 100,
        width: '100px',
        height: '140px'
      }}
    >
      <motion.button
        aria-label="Open navigation"
        onClick={onOpen}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        className={[
          "relative nav-glow",
          className || ""
        ].join(" ")}
        data-view-transition-name="nav-trigger"
      >
      {/* The Magic Mirror SVG - this will be the base */}
      <MagicMirrorSVG className="w-full h-full" />

      {/* The Dramatic Mask-Like Face - slowly emerging from the mirror */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none"
        style={{ 
          width: '45%', 
          height: '55%',
          top: '50%',
          left: '50%'
        }} // Centered in the mirror
        initial={{ opacity: 0, scale: 0.3, z: -50 }}
        animate={prefersReduced ? { opacity: 0.4, scale: 0.8, z: 0 } : { 
          opacity: [0, 0.1, 0.3, 0.6, 0.8, 0.9, 0.7, 0.4, 0.1, 0],
          scale: [0.3, 0.4, 0.5, 0.7, 0.9, 1.0, 0.95, 0.8, 0.6, 0.3],
          z: [-50, -30, -10, 0, 10, 20, 15, 5, -5, -20]
        }}
        transition={prefersReduced ? { duration: 0 } : { 
          duration: 12, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      >
        {/* Detailed mask-like face with sharp features */}
        <div className="relative w-full h-full">
          {/* Upper face - deep purple with sharp contours */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-2/5 bg-purple-700 rounded-t-lg opacity-90" 
               style={{ clipPath: 'polygon(20% 0%, 80% 0%, 90% 60%, 10% 60%)' }} />
          
          {/* Sharp eyebrows - purple */}
          <div className="absolute top-1/4 left-1/4 w-1/3 h-1 bg-purple-800 rounded-full transform rotate-12 opacity-95" />
          <div className="absolute top-1/4 right-1/4 w-1/3 h-1 bg-purple-800 rounded-full transform -rotate-12 opacity-95" />
          
          {/* Lower face - bright lime green */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-3/5 bg-lime-400 rounded-b-lg opacity-85" 
               style={{ clipPath: 'polygon(10% 40%, 90% 40%, 85% 100%, 15% 100%)' }} />
          
          {/* Hollow eye sockets - large and menacing */}
          <div className="absolute top-1/3 left-1/4 w-3 h-4 bg-black rounded-full opacity-95 transform -rotate-6" />
          <div className="absolute top-1/3 right-1/4 w-3 h-4 bg-black rounded-full opacity-95 transform rotate-6" />
          
          {/* Pointed nose - green highlight */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-1 h-2 bg-lime-300 rounded-full opacity-80" />
          
          {/* Wide sinister mouth - dark red-purple */}
          <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-4 h-2 bg-red-900 rounded-full opacity-90 transform scale-x-150" />
          
          {/* Sharp cheekbones - green highlights */}
          <div className="absolute top-2/3 left-1/6 w-2 h-1 bg-lime-300 rounded-full opacity-70 transform rotate-45" />
          <div className="absolute top-2/3 right-1/6 w-2 h-1 bg-lime-300 rounded-full opacity-70 transform -rotate-45" />
          
          {/* Pointed chin - green */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-lime-500 rounded-full opacity-80" />
        </div>
      </motion.div>

      {/* Swirling smoke effects around the face */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ 
          width: '60%', 
          height: '70%',
          top: '50%',
          left: '50%'
        }}
        initial={{ opacity: 0 }}
        animate={prefersReduced ? { opacity: 0.2 } : { 
          opacity: [0, 0.1, 0.3, 0.2, 0.4, 0.1, 0],
          rotate: [0, 15, -10, 20, -15, 0]
        }}
        transition={prefersReduced ? { duration: 0 } : { 
          duration: 15, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      >
        {/* Swirling green-yellow smoke */}
        <div className="absolute bottom-0 left-1/4 w-1/3 h-1/2 bg-lime-300 rounded-full opacity-30 blur-sm transform rotate-12" />
        <div className="absolute bottom-0 right-1/4 w-1/3 h-1/2 bg-yellow-400 rounded-full opacity-25 blur-sm transform -rotate-12" />
        <div className="absolute top-1/2 left-0 w-1/4 h-1/3 bg-lime-200 rounded-full opacity-20 blur-sm transform rotate-45" />
        <div className="absolute top-1/2 right-0 w-1/4 h-1/3 bg-yellow-300 rounded-full opacity-20 blur-sm transform -rotate-45" />
      </motion.div>
    </motion.button>
    </div>
  );
}