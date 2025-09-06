import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { HuntProvider } from "@/components/hunt/HuntProvider";
import HuntProgress from "@/components/hunt/HuntProgress";
import HuntReward from "@/components/hunt/HuntReward";
import SkipLink from "@/components/SkipLink";
import Index from "./pages/Index";
import About from "./pages/About";
import Vignettes from "./pages/Vignettes";
import Schedule from "./pages/Schedule";
import Costumes from "./pages/Costumes";
import Feast from "./pages/Feast";
import RSVP from "./pages/RSVP";
import Gallery from "./pages/Gallery";
import Discussion from "./pages/Discussion";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <HuntProvider>
        <SkipLink />
        <Toaster />
        <Sonner />
        <ErrorBoundary>
          <Suspense fallback={
            <div className="p-8 text-center text-[--ink]/80">Loading…</div>
          }>
            <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/vignettes" element={<Vignettes />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/costumes" element={<Costumes />} />
              <Route path="/feast" element={<Feast />} />
              <Route path="/rsvp" element={<RSVP />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/discussion" element={<Discussion />} />
              <Route path="/contact" element={<Contact />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </Suspense>
        </ErrorBoundary>
        
        {/* Hunt UI overlays */}
        <HuntProgress />
        <HuntReward />
      </HuntProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
