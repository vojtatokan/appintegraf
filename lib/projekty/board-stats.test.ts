import { describe, expect, it } from "vitest";
import { boardStats } from "./board-stats";
import type { CardData } from "@/components/projekty/boards/CardItem";
import type { ListData } from "@/components/projekty/boards/BoardListColumn";

function card(id: string, overrides: Partial<CardData> = {}): CardData {
  return {
    id,
    number: `T-${id}`,
    listId: "l1",
    boardId: "b1",
    title: `Karta ${id}`,
    description: null,
    position: 1,
    dueDate: null,
    startDate: null,
    completed: false,
    archived: false,
    priority: null,
    members: [],
    labels: [],
    ...overrides,
  };
}

function daysFromToday(days: number): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + days, 12).toISOString();
}

function list(id: string, cards: CardData[]): ListData {
  return { id, boardId: "b1", name: id, color: null, position: 1, archived: false, cards };
}

describe("boardStats", () => {
  it("prázdný board = samé nuly", () => {
    expect(boardStats([])).toEqual({ total: 0, done: 0, overdue: 0 });
  });

  it("sečte karty napříč sloupci a hotové", () => {
    const lists = [
      list("l1", [card("a"), card("b", { completed: true })]),
      list("l2", [card("c", { completed: true })]),
    ];
    expect(boardStats(lists)).toEqual({ total: 3, done: 2, overdue: 0 });
  });

  it("po termínu počítá jen nedokončené karty s minulým dueDate", () => {
    const lists = [
      list("l1", [
        card("a", { dueDate: daysFromToday(-1) }),
        card("b", { dueDate: daysFromToday(-2), completed: true }),
        card("c", { dueDate: daysFromToday(3) }),
        card("d", { dueDate: null }),
      ]),
    ];
    expect(boardStats(lists)).toEqual({ total: 4, done: 1, overdue: 1 });
  });
});
