import React from 'react';
import { motion } from 'framer-motion';
import { VignetteGrid, VignetteCard } from './VignetteCard';
import { HuntHint, useHuntSystem } from './HuntSystem';

const ModernHomePage: React.FC = () => {
  const huntSystem = useHuntSystem();

  const vignettes = [
    {
      id: 'goldilocks',
      title: 'Goldilocks',
      subtitle: 'The Butcher\'s Den',
      hook: 'What if the cozy little cottage wasn\'t a home at all… but a butcher\'s den?',
      imageUrl: '/img/goldilocks-teaser.jpg',
      huntHint: {
        id: 'vignettes.card.apple',
        hint: 'A single bite can feed seven.',
        found: huntSystem.foundHints.includes('vignettes.card.apple'),
        onFound: huntSystem.markHintFound
      }
    },
    {
      id: 'jack',
      title: 'Jack & the Beanstalk',
      subtitle: 'A Thief\'s Reward',
      hook: 'What if Jack wasn\'t a hero at all, but a thief who finally got what he deserved?',
      imageUrl: '/img/jack-teaser.jpg',
      huntHint: {
        id: 'vignettes.card.goose',
        hint: 'Greed gilds the beak.',
        found: huntSystem.foundHints.includes('vignettes.card.goose'),
        onFound: huntSystem.markHintFound
      }
    },
    {
      id: 'snow-white',
      title: 'Snow White',
      subtitle: 'The Glass Coffin Feast',
      hook: 'What if the seven dwarves had a curse of their own?',
      imageUrl: '/img/snow-white-teaser.jpg',
      huntHint: {
        id: 'vignettes.card.porridge',
        hint: 'Too hot, too cold, just right… for someone else.',
        found: huntSystem.foundHints.includes('vignettes.card.porridge'),
        onFound: huntSystem.markHintFound
      }
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Modern CSS */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>
        
        {/* Overlay with Backdrop Filter */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        
        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.h1
            className="text-6xl md:text-8xl font-heading text-white mb-6 text-shadow-gothic"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            Twisted Fairytale
          </motion.h1>
          
          <motion.p
            className="text-2xl md:text-3xl font-subhead text-accent-gold mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            Grimm, gruesome, and just the right amount of wrong.
          </motion.p>
          
          {/* Hunt Hints in Hero */}
          <div className="flex justify-center space-x-4 mb-8">
            <HuntHint
              id="hero.tagline.crow"
              hint="It knows who watched the moon fall."
              found={huntSystem.foundHints.includes('hero.tagline.crow')}
              onFound={huntSystem.markHintFound}
              className="text-accent-gold hover:text-accent-green transition-colors"
            >
              <span className="text-2xl">🐦</span>
            </HuntHint>
            
            <HuntHint
              id="hero.video.vine"
              hint="Follow the thorn that points away from the path."
              found={huntSystem.foundHints.includes('hero.video.vine')}
              onFound={huntSystem.markHintFound}
              className="text-accent-gold hover:text-accent-green transition-colors"
            >
              <span className="text-2xl">🌿</span>
            </HuntHint>
          </div>
          
          <motion.button
            className="bg-accent-red text-white px-8 py-4 rounded-lg text-xl font-bold hover:bg-accent-red/90 transition-colors focus-ring glow-gold"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            RSVP Now
          </motion.button>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center">
            <motion.div
              className="w-1 h-3 bg-white/60 rounded-full mt-2"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* About Section with Container Queries */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="grid md:grid-cols-2 gap-12 items-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="space-y-6">
              <h2 className="text-4xl font-heading text-foreground">
                About the Theme
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Step into a darker storybook. This year's Halloween theme twists beloved 
                fairytales into sinister endings. Heroes may fall, villains may triumph, 
                and happily-ever-after becomes happily-never-after.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Guests are encouraged to reinterpret classic tales with their own wicked 
                spin—whether gruesome, funny, or both.
              </p>
              
              {/* Hunt Hint in About Section */}
              <HuntHint
                id="about.tree.shadow"
                hint="It grew where the story ended."
                found={huntSystem.foundHints.includes('about.tree.shadow')}
                onFound={huntSystem.markHintFound}
                className="inline-block"
              >
                <span className="text-2xl">🌳</span>
              </HuntHint>
            </div>
            
            <div className="relative">
              <img
                src="/img/about-collage.jpg"
                alt="Twisted Fairytale Collage"
                className="w-full h-96 object-cover rounded-lg glassmorphism-card"
                loading="lazy"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Vignettes Section with Modern Grid */}
      <section className="py-20 px-4 bg-card">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-heading text-foreground mb-4">
              Twisted Tales of Years Past
            </h2>
            <p className="text-lg text-muted-foreground">
              Explore the dark reimaginings that have haunted our halls
            </p>
          </motion.div>
          
          <VignetteGrid vignettes={vignettes} />
        </div>
      </section>

      {/* Activities Section with Scroll Animations */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-heading text-foreground mb-4">
              Activities & Schedule
            </h2>
            <p className="text-lg text-muted-foreground">
              A night of twisted delights awaits
            </p>
          </motion.div>
          
          <div className="space-y-8">
            {[
              { time: '7:00 PM', activity: 'Welcome Drinks', icon: '🍷' },
              { time: '8:00 PM', activity: 'Costume Contest', icon: '👑' },
              { time: '9:00 PM', activity: 'Games & Photos', icon: '📸' },
              { time: '10:00 PM', activity: 'Feast & Drinks', icon: '🍽️' }
            ].map((item, index) => (
              <motion.div
                key={item.time}
                className="flex items-center space-x-6 p-6 rounded-lg glassmorphism-card"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-3xl">{item.icon}</div>
                <div className="flex-1">
                  <div className="text-2xl font-bold text-foreground">{item.time}</div>
                  <div className="text-lg text-muted-foreground">{item.activity}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer with Hunt Hints */}
      <footer className="py-12 px-4 bg-card border-t border-border">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="flex justify-center space-x-8 mb-6">
            <HuntHint
              id="footer.candle.one"
              hint="A light that refuses to remember."
              found={huntSystem.foundHints.includes('footer.candle.one')}
              onFound={huntSystem.markHintFound}
              className="text-accent-gold hover:text-accent-green transition-colors"
            >
              <span className="text-2xl">🕯️</span>
            </HuntHint>
            
            <HuntHint
              id="footer.candle.two"
              hint="Two flames, one shadow."
              found={huntSystem.foundHints.includes('footer.candle.two')}
              onFound={huntSystem.markHintFound}
              className="text-accent-gold hover:text-accent-green transition-colors"
            >
              <span className="text-2xl">🕯️</span>
            </HuntHint>
          </div>
          
          <p className="text-muted-foreground">
            Hosted by Jamie & Kat Ruth • Questions? Contact Us
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ModernHomePage;
