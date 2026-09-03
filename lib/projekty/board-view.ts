export type BoardViewType = "kanban" | "list" | "calendar";

const VALID_VIEWS: readonly BoardViewType[] = ["kanban", "list", "calendar"] as const;

export function parseBoardView(
  searchParams: URLSearchParams | { get(k: string): string | null },
): BoardViewType {
  const raw = searchParams.get("view");
  if (raw && VALID_VIEWS.includes(raw as BoardViewType)) {
    return raw as BoardViewType;
  }
  return "kanban";
}

/**
 * Čistá URL-patch operace pro přepnutí pohledu (D4/D6): nastaví/smaže `?view=` a spolu
 * s ním uklidí parametry patřící jen jinému pohledu (`month` mimo kalendář, `group` mimo
 * seznam). Vrací query string bez vedoucího `?` (prázdný, pokud nezbyly žádné parametry).
 * Sdíleno mezi BoardToolbar.setView a BoardView.handleNewCard — stejná invariance musí žít
 * jen na jednom místě.
 */
export function boardViewQuery(searchParams: URLSearchParams, view: BoardViewType): string {
  const sp = new URLSearchParams(searchParams.toString());
  if (view === "kanban") sp.delete("view");
  else sp.set("view", view);
  if (view !== "calendar") sp.delete("month");
  if (view !== "list") sp.delete("group");
  return sp.toString();
}

export type BoardGroupBy = "list" | "assignee" | "due" | "priority";

const VALID_GROUPS: readonly BoardGroupBy[] = ["list", "assignee", "due", "priority"] as const;

/** ?group= pro list view — whitelist, default seskupení podle sloupce. */
export function parseBoardGroup(
  searchParams: URLSearchParams | { get(k: string): string | null },
): BoardGroupBy {
  const raw = searchParams.get("group");
  if (raw && VALID_GROUPS.includes(raw as BoardGroupBy)) {
    return raw as BoardGroupBy;
  }
  return "list";
}

/**
 * Year/month parsed from ?month=YYYY-MM. Defaults to current month
 * (Europe/Prague) when missing or invalid.
 */
export function parseCalendarMonth(
  searchParams: URLSearchParams | { get(k: string): string | null },
): { year: number; month: number } {
  const raw = searchParams.get("month");
  const now = new Date();
  const fallback = { year: now.getFullYear(), month: now.getMonth() + 1 };

  if (!raw) return fallback;
  const match = /^(\d{4})-(\d{2})$/.exec(raw);
  if (!match) return fallback;

  const year = Number(match[1]);
  const month = Number(match[2]);
  if (Number.isNaN(year) || Number.isNaN(month)) return fallback;
  if (month < 1 || month > 12) return fallback;

  return { year, month };
}

export function formatCalendarMonth(input: { year: number; month: number }): string {
  const mm = String(input.month).padStart(2, "0");
  return `${input.year}-${mm}`;
}
