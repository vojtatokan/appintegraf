type ChecklistLike = { items: { done: boolean }[] };

export function summarizeChecklists(lists: ChecklistLike[]): { done: number; total: number; pct: number } {
  const items = lists.flatMap((l) => l.items);
  const total = items.length;
  const done = items.filter((i) => i.done).length;
  return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
}

/** Druhý checklist dává smysl až když první něco obsahuje (D12, progressive disclosure). */
export function canAddAnotherChecklist(lists: ChecklistLike[]): boolean {
  return lists.some((l) => l.items.length > 0);
}
