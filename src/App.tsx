import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/lib/auth";
import { HuntProvider } from "@/components/hunt/HuntProvider";
import { AdminProvider } from "@/contexts/AdminContext";
import { AudioProvider } from "@/contexts/AudioContext";
import HuntProgress from "@/components/hunt/HuntProgress";
import HuntReward from "@/components/hunt/HuntReward";
import HuntNotification from "@/components/hunt/HuntNotification";
import SkipLink from "@/components/SkipLink";
import NavBar from "@/components/NavBar";
import { SwipeNavigator } from "@/components/SwipeNavigator";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy load non-critical pages
const About = lazy(() => import("./pages/About"));
const Vignettes = lazy(() => import("./pages/Vignettes"));
const Schedule = lazy(() => import("./pages/Schedule"));
const Costumes = lazy(() => import("./pages/Costumes"));
const Feast = lazy(() => import("./pages/Feast"));
const RSVP = lazy(() => import("./pages/RSVP"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Discussion = lazy(() => import("./pages/Discussion"));
const Contact = lazy(() => import("./pages/Contact"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const TestPage = lazy(() => import("./pages/TestPage"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AdminProvider>
          <HuntProvider>
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <AudioProvider>
                <SkipLink />
                <NavBar />
                <main>
                  <SwipeNavigator>
                    <Toaster />
                    <Sonner />
                    <ErrorBoundary>
                      <Suspense fallback={
                        <div className="p-8 text-center text-[--ink]/80">Loading…</div>
                      }>
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
                          <Route path="/auth" element={<AuthCallback />} />
                          <Route path="/test" element={<TestPage />} />
                          <Route path="/admin" element={<AdminDashboard />} />
                          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </Suspense>
                    </ErrorBoundary>
                  </SwipeNavigator>
                </main>
                
                {/* Hunt UI overlays */}
                <HuntProgress />
                <HuntReward />
                <HuntNotification />
              </AudioProvider>
            </BrowserRouter>
          </HuntProvider>
        </AdminProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
