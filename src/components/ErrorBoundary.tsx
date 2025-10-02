import React from "react";
import { reportError } from "@/lib/error-telemetry";

type State = { hasError: boolean };

export class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false };
  
  static getDerivedStateFromError() { 
    return { hasError: true }; 
  }
  
  componentDidCatch(error: unknown, info: unknown) {
    console.error("Error caught by boundary:", error, info);
    // Best-effort telemetry without PII (no-op if not configured)
    reportError(error, info);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="mx-auto my-12 max-w-prose rounded-lg bg-black/90 backdrop-blur-sm p-6 text-[--ink]">
          <h2 className="mb-2 text-xl font-semibold">Something went wrong.</h2>
          <p>Try refreshing the page. If the problem persists, please let the hosts know.</p>
        </div>
      );
    }
    return this.props.children;
  }
}