export default function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only fixed left-3 top-3 z-[100] rounded bg-[--accent-gold] px-3 py-2 text-black shadow-lg"
    >
      Skip to main content
    </a>
  );
}