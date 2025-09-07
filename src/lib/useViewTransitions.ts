export function startViewTransition(run: () => void) {
  const anyDoc = document as any;
  if (anyDoc.startViewTransition) {
    return anyDoc.startViewTransition(() => run());
  }
  run();
}