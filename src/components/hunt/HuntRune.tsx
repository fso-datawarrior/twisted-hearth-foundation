import React, { Suspense } from "react";
import { HUNT_ENABLED } from "./hunt-config";

// Mirror the original props so all pages can keep the same usage
export type HuntRuneProps = {
  id: string;
  label: string;
  hint?: string;
  className?: string;
  bonus?: boolean;
};

// Lazy-load the real implementation ONLY when the feature is enabled
const HuntRuneLazy = React.lazy(() => import("./HuntRuneImpl"));

export default function HuntRune(props: HuntRuneProps) {
  if (!HUNT_ENABLED) return null;
  return (
    <Suspense fallback={null}>
      <HuntRuneLazy {...props} />
    </Suspense>
  );
}
