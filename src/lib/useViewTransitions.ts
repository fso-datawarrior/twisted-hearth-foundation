export function startViewTransition(run: () => void) {
  const anyDoc = document as any;
  if (anyDoc.startViewTransition) {
    // @ts-expect-error
    return anyDoc.startViewTransition(() => run());
  }
  run();
}