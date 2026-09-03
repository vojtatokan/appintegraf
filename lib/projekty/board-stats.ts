import type { ListData } from "@/components/projekty/boards/BoardListColumn";

export type BoardStats = { done: number; total: number; overdue: number };

/** Souhrn karet boardu pro BoardToolbar (D4): X/Y hotovo · N po termínu. */
export function boardStats(lists: ListData[]): BoardStats {
  const cards = lists.flatMap((l) => l.cards);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return {
    total: cards.length,
    done: cards.filter((c) => c.completed).length,
    overdue: cards.filter((c) => !c.completed && c.dueDate && new Date(c.dueDate) < today).length,
  };
}
