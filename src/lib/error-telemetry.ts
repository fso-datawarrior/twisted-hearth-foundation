// Minimal client-side error telemetry without PII
// Optional: set VITE_TELEMETRY_URL to enable

const TELEMETRY_URL = (import.meta as any)?.env?.VITE_TELEMETRY_URL as string | undefined;

function redactStack(stack?: string | null): string | undefined {
  if (!stack) return undefined;
  // Strip file paths and query params heuristically
  return stack
    .split('\n')
    .map((line) => line.replace(/[\(]?(https?:)?\/\/[^\s\)]*[\)]?/g, '(url)'))
    .join('\n');
}

function serialize(error: unknown, info: unknown) {
  const e = error as any;
  const componentStack = (info as any)?.componentStack as string | undefined;
  return {
    // Do not include arbitrary app state or user data
    name: e?.name || 'Error',
    message: typeof e?.message === 'string' ? e.message.slice(0, 500) : 'unknown',
    stack: redactStack(typeof e?.stack === 'string' ? e.stack : undefined),
    componentStack: componentStack ? componentStack.slice(0, 2000) : undefined,
    url: typeof location !== 'undefined' ? location.pathname + location.search : undefined,
    ts: new Date().toISOString(),
    ua: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    build: (import.meta as any)?.env?.MODE,
  };
}

export async function reportError(error: unknown, info: unknown) {
  if (!TELEMETRY_URL) return; // no-op if not configured
  try {
    const payload = JSON.stringify(serialize(error, info));

    if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      const blob = new Blob([payload], { type: 'application/json' });
      const ok = (navigator as any).sendBeacon(TELEMETRY_URL, blob);
      if (ok) return;
    }

    await fetch(TELEMETRY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: payload,
    });
  } catch {
    // swallow
  }
}
