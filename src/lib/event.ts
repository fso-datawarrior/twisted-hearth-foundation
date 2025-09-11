export const EVENT = {
  // Local time for the party start
  startISO: "2025-10-18T19:00:00-06:00", // America/Denver is UTC-6 on this date
  // Party ends at 3am next day (witching hour)
  endISO: "2025-10-19T03:00:00-06:00",
  timezone: "America/Denver",
  title: "The Ruths' Twisted Fairytale Halloween Bash",
};

// Add helper function for party end check
export function isPartyOver(): boolean {
  return new Date() > new Date(EVENT.endISO);
}

export function formatEventLong(d = new Date(EVENT.startISO)) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: EVENT.timezone,
  }).format(d);
}

export function formatEventShort(d = new Date(EVENT.startISO)) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: EVENT.timezone,
  }).format(d);
}

export function formatEventTime(d = new Date(EVENT.startISO)) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: EVENT.timezone,
  }).format(d);
}