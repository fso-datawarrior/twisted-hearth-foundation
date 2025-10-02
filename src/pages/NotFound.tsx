import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-4 max-w-2xl">
        <div className="rounded-xl border border-[rgba(212,175,55,0.4)] bg-card/60 backdrop-blur-sm p-8 md:p-12 text-center shadow-[0_8px_32px_rgba(212,175,55,0.2)]">
          {/* 404 Number */}
          <h1 className="mb-4 text-6xl md:text-8xl font-heading font-bold text-accent text-shadow-gothic">
            404
          </h1>
          
          {/* Message */}
          <h2 className="mb-3 text-2xl md:text-3xl font-heading text-foreground">
            Lost in the Enchanted Forest?
          </h2>
          <p className="mb-8 text-base md:text-lg text-muted-foreground">
            This path leads to nowhere... Perhaps you should return to the realm.
          </p>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/">
              <Button 
                className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold shadow-[0_0_20px_rgba(197,164,93,0.3)] hover:shadow-[0_0_30px_rgba(197,164,93,0.5)] transition-all"
              >
                <Home className="h-4 w-4" />
                Return Home
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
              className="gap-2 border-accent/40 text-foreground hover:bg-accent/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          </div>

          {/* Decorative element */}
          <p className="mt-8 text-sm text-muted-foreground/60 italic">
            "Not all who wander are lost... but you definitely are."
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
