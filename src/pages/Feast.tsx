import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import HuntHintTrigger from "@/components/hunt/HuntHintTrigger";

const Feast = () => {
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

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="pt-20">
        <section className="py-16 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="relative">
              <HuntHintTrigger 
                id="feast.header" 
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
              <div className="grid md:grid-cols-2 gap-8">
                {signatureDrinks.map((drink, index) => (
                  <div 
                    key={index}
                    className="bg-card p-6 rounded-lg border border-accent-purple/30 hover:border-accent-gold/50 transition-colors motion-safe relative"
                  >
                    {index === 0 && (
                      <HuntHintTrigger 
                        id="feast.board" 
                        label="A diced confession"
                        className="absolute top-2 right-2"
                      />
                    )}
                    <h3 className="font-subhead text-xl mb-3 text-accent-red">
                      {drink.name}
                    </h3>
                    <p className="font-body text-muted-foreground mb-4">
                      {drink.description}
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
                </div>
              </div>
            </div>
            
            {/* Potluck Guidelines */}
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
                    <h3 className="font-subhead text-xl mb-4 text-accent-purple">
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
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-subhead text-lg mb-3 text-accent-purple">Food Safety</h4>
                    <ul className="font-body text-sm text-muted-foreground space-y-1">
                      <li>• Include ingredient list for allergens</li>
                      <li>• Keep hot foods hot, cold foods cold</li>
                      <li>• Label if vegetarian/vegan/gluten-free</li>
                      <li>• No home-canned items please</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-subhead text-lg mb-3 text-accent-purple">Presentation</h4>
                    <ul className="font-body text-sm text-muted-foreground space-y-1">
                      <li>• Bring serving utensils</li>
                      <li>• Include a small card explaining your dish's story</li>
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
    </div>
  );
};

export default Feast;