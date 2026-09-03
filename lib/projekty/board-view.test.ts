import { describe, expect, it } from "vitest";
import {
  boardViewQuery,
  formatCalendarMonth,
  parseBoardGroup,
  parseBoardView,
  parseCalendarMonth,
} from "./board-view";

describe("parseBoardView", () => {
  it("neznámá/chybějící hodnota = kanban", () => {
    expect(parseBoardView(new URLSearchParams())).toBe("kanban");
    expect(parseBoardView(new URLSearchParams("view=nesmysl"))).toBe("kanban");
  });
  it("platné hodnoty projdou beze změny", () => {
    expect(parseBoardView(new URLSearchParams("view=list"))).toBe("list");
    expect(parseBoardView(new URLSearchParams("view=calendar"))).toBe("calendar");
  });
});

describe("parseBoardGroup", () => {
  it("neznámá/chybějící hodnota = list", () => {
    expect(parseBoardGroup(new URLSearchParams())).toBe("list");
    expect(parseBoardGroup(new URLSearchParams("group=nesmysl"))).toBe("list");
  });
  it("platná hodnota projde beze změny", () => {
    expect(parseBoardGroup(new URLSearchParams("group=priority"))).toBe("priority");
  });
});

describe("parseCalendarMonth / formatCalendarMonth", () => {
  it("neplatný/chybějící ?month= spadne na aktuální měsíc", () => {
    const now = new Date();
    expect(parseCalendarMonth(new URLSearchParams())).toEqual({
      year: now.getFullYear(),
      month: now.getMonth() + 1,
    });
    expect(parseCalendarMonth(new URLSearchParams("month=xx"))).toEqual({
      year: now.getFullYear(),
      month: now.getMonth() + 1,
    });
  });
  it("round-trip přes formát YYYY-MM", () => {
    expect(parseCalendarMonth(new URLSearchParams("month=2026-09"))).toEqual({
      year: 2026,
      month: 9,
    });
    expect(formatCalendarMonth({ year: 2026, month: 9 })).toBe("2026-09");
  });
});

describe("boardViewQuery", () => {
  it("přepnutí z kalendáře na kanban smaže view i month", () => {
    const sp = new URLSearchParams("view=calendar&month=2026-09");
    expect(boardViewQuery(sp, "kanban")).toBe("");
  });

  it("přepnutí ze seznamu na kalendář smaže group, nastaví view, zachová ostatní parametry", () => {
    const sp = new URLSearchParams("view=list&group=due&members=1");
    expect(boardViewQuery(sp, "calendar")).toBe("view=calendar&members=1");
  });

  it("přepnutí na seznam zachová group, smaže month", () => {
    const sp = new URLSearchParams("view=calendar&month=2026-09&group=due");
    expect(boardViewQuery(sp, "list")).toBe("view=list&group=due");
  });

  it("kanban nikdy nemá ?view= v URL", () => {
    const sp = new URLSearchParams("members=1,2");
    expect(boardViewQuery(sp, "kanban")).toBe("members=1%2C2");
  });
});
