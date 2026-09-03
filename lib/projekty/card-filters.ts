import { getDueStatus, startOfLocalDay } from "./due-date";
import { isCardPriority, PRIORITY_LABELS, type CardPriorityValue } from "./priority";

export type CardFilters = {
  q?: string;
  memberIds?: string[];
  labelIds?: string[];
  dueRange?: "overdue" | "today" | "week" | "none";
  completed?: "true" | "false" | "any";
  /** Prázdné/nepřítomné = bez filtru. "none" = karty bez priority. */
  priorities?: (CardPriorityValue | "none")[];
};

export function parseCardFilters(
  searchParams: URLSearchParams | { get(k: string): string | null },
): CardFilters {
  const get = (k: string) => searchParams.get(k);
  return {
    q: get("q") ?? undefined,
    memberIds: get("members")?.split(",").filter(Boolean),
    labelIds: get("labels")?.split(",").filter(Boolean),
    dueRange: (get("due") as CardFilters["dueRange"]) ?? undefined,
    completed: (get("completed") as CardFilters["completed"]) ?? "any",
    priorities: parsePriorityParam(get("priority")),
  };
}

/** Neznámé hodnoty z URL zahazujeme — jinak by filtr tiše nevrátil nic. */
function parsePriorityParam(raw: string | null): CardFilters["priorities"] {
  if (!raw) return undefined;
  const values = raw
    .split(",")
    .filter((v) => v === "none" || isCardPriority(v)) as (CardPriorityValue | "none")[];
  return values.length > 0 ? values : undefined;
}

/** Jediné místo, které zná množinu URL klíčů patřících CardFilters — sdíleno mezi serializeCardFilters a patchCardFiltersUrl. */
const CARD_FILTER_URL_KEYS = ["q", "members", "labels", "due", "completed", "priority"] as const;

export function serializeCardFilters(filters: CardFilters): URLSearchParams {
  const sp = new URLSearchParams();
  if (filters.q) sp.set("q", filters.q);
  if (filters.memberIds?.length) sp.set("members", filters.memberIds.join(","));
  if (filters.labelIds?.length) sp.set("labels", filters.labelIds.join(","));
  if (filters.dueRange) sp.set("due", filters.dueRange);
  if (filters.completed && filters.completed !== "any") {
    sp.set("completed", filters.completed);
  }
  if (filters.priorities?.length) sp.set("priority", filters.priorities.join(","));
  return sp;
}

/**
 * Čistá URL-patch operace pro filtry karet: sloučí `patch` do `filters`, smaže staré
 * filter klíče z `searchParams` (CARD_FILTER_URL_KEYS) a znovu je serializuje. Ostatní
 * parametry (view, group, month, card, …) zůstávají beze změny. Vrací query string bez
 * vedoucího `?` (prázdný řetězec, pokud nezbyly žádné parametry).
 */
export function patchCardFiltersUrl(
  searchParams: URLSearchParams,
  filters: CardFilters,
  patch: Partial<CardFilters>,
): string {
  const next = { ...filters, ...patch };
  const sp = new URLSearchParams(searchParams.toString());
  for (const k of CARD_FILTER_URL_KEYS) sp.delete(k);
  for (const [k, v] of serializeCardFilters(next).entries()) sp.set(k, v);
  return sp.toString();
}

export function matchesFilters(
  card: {
    title: string;
    completed: boolean;
    dueDate: Date | string | null;
    members: { userId: number }[];
    labels: { labelId: string }[];
    priority?: CardPriorityValue | null;
  },
  filters: CardFilters,
): boolean {
  if (filters.q && !card.title.toLowerCase().includes(filters.q.toLowerCase())) {
    return false;
  }
  if (filters.memberIds?.length) {
    const memberSet = new Set(card.members.map((m) => String(m.userId)));
    if (!filters.memberIds.some((id) => memberSet.has(id))) return false;
  }
  if (filters.labelIds?.length) {
    const labelSet = new Set(card.labels.map((l) => l.labelId));
    if (!filters.labelIds.some((id) => labelSet.has(id))) return false;
  }
  if (filters.completed === "true" && !card.completed) return false;
  if (filters.completed === "false" && card.completed) return false;
  if (filters.priorities?.length) {
    if (!filters.priorities.includes(card.priority ?? "none")) return false;
  }
  if (filters.dueRange) {
    if (filters.dueRange === "none") {
      if (card.dueDate) return false;
    } else {
      if (!card.dueDate) return false;
      const due = new Date(card.dueDate);
      const today = startOfLocalDay();
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

      if (filters.dueRange === "overdue") {
        if (getDueStatus(due, card.completed) !== "overdue") return false;
      } else if (filters.dueRange === "today") {
        // Záměrně bez completed guardu — filtr „dnes" má ukázat i hotové (filtr ≠ badge).
        if (due < today || due >= tomorrow) return false;
      } else if (filters.dueRange === "week") {
        if (due < today || due >= weekFromNow) return false;
      }
    }
  }
  return true;
}

export function countActiveFilters(f: CardFilters): number {
  let n = 0;
  if (f.q) n++;
  if (f.memberIds?.length) n++;
  if (f.labelIds?.length) n++;
  if (f.priorities?.length) n++;
  if (f.dueRange) n++;
  if (f.completed === "false" || f.completed === "true") n++;
  return n;
}

export type FilterChip = { key: string; label: string; clear: Partial<CardFilters> };

const DUE_LABELS: Record<NonNullable<CardFilters["dueRange"]>, string> = {
  overdue: "Po termínu",
  today: "Dnes",
  week: "Tento týden",
  none: "Bez termínu",
};

export function filterChips(
  f: CardFilters,
  ctx: {
    members: { id: number; name: string | null; email: string | null }[];
    labels: { id: string; name: string }[];
  },
): FilterChip[] {
  const chips: FilterChip[] = [];
  if (f.q) chips.push({ key: "q", label: `„${f.q}“`, clear: { q: undefined } });
  for (const id of f.memberIds ?? []) {
    const u = ctx.members.find((m) => String(m.id) === id);
    chips.push({ key: `m:${id}`, label: u?.name ?? u?.email ?? "?", clear: { memberIds: undefined } });
  }
  for (const id of f.labelIds ?? []) {
    const l = ctx.labels.find((x) => x.id === id);
    chips.push({ key: `l:${id}`, label: l?.name ?? "?", clear: { labelIds: undefined } });
  }
  for (const p of f.priorities ?? []) {
    chips.push({ key: `p:${p}`, label: p === "none" ? "Bez priority" : PRIORITY_LABELS[p], clear: { priorities: undefined } });
  }
  if (f.dueRange) chips.push({ key: "due", label: DUE_LABELS[f.dueRange], clear: { dueRange: undefined } });
  if (f.completed === "false") chips.push({ key: "done", label: "Bez hotových", clear: { completed: "any" } });
  if (f.completed === "true") chips.push({ key: "done", label: "Jen hotové", clear: { completed: "any" } });
  return chips;
}
