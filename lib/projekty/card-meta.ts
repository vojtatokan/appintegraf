import type { CardPriorityValue } from "./priority";

export type UserLite = { id: number; email: string | null; name: string | null; image: string | null };

export type CardMetaInput = {
  priority: CardPriorityValue | null;
  labels: { label: { id: string; name: string; color: string } }[];
  dueDate: Date | string | null;
  completed: boolean;
  members: { user: UserLite }[];
  checklistDone?: number;
  checklistTotal?: number;
};

export type CardMeta = {
  /** Vlaječka jen pro urgentní stupně (D8). Není metadata, je to signál stavu. */
  flag: "URGENT" | "HIGH" | null;
  /** 3px proužek vlevo = barva prvního štítku; title nese všechny názvy (D7). */
  labelStrip: { color: string; title: string } | null;
  due: Date | null;
  checklist: { done: number; total: number; complete: boolean } | null;
  /** Jen první přiřazený (ve vlně 7 = OWNER). Žádné +N. */
  owner: UserLite | null;
  /** Počet zobrazených metadat mimo název — pravidlo C3 říká max 3. */
  metaCount: number;
};

export function cardMeta(card: CardMetaInput): CardMeta {
  const flag = card.priority === "URGENT" || card.priority === "HIGH" ? card.priority : null;
  const first = card.labels[0]?.label;
  const labelStrip = first
    ? { color: first.color, title: card.labels.map((l) => l.label.name).join(", ") }
    : null;
  const due = card.dueDate ? new Date(card.dueDate) : null;
  const total = card.checklistTotal ?? 0;
  const done = card.checklistDone ?? 0;
  const checklist = total > 0 ? { done, total, complete: done === total } : null;
  const owner = card.members[0]?.user ?? null;
  const metaCount = [due, checklist, owner].filter(Boolean).length;
  return { flag, labelStrip, due, checklist, owner, metaCount };
}
