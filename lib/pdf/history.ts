/** Historial simple para deshacer / rehacer estados de páginas. */

export type HistorySnapshot<T> = {
  pages: T[];
};

export function pushHistory<T>(
  past: HistorySnapshot<T>[],
  present: HistorySnapshot<T>,
  limit = 40,
): HistorySnapshot<T>[] {
  const next = [...past, present];
  if (next.length > limit) return next.slice(next.length - limit);
  return next;
}
