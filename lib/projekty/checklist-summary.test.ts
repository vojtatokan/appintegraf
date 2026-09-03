import { describe, expect, it } from "vitest";
import { canAddAnotherChecklist, summarizeChecklists } from "./checklist-summary";

const cl = (dones: boolean[]) => ({ items: dones.map((done) => ({ done })) });

describe("summarizeChecklists", () => {
  it("sčítá přes všechny checklisty", () => {
    expect(summarizeChecklists([cl([true, false]), cl([true])])).toEqual({ done: 2, total: 3, pct: 67 });
  });
  it("prázdno = 0 %", () => {
    expect(summarizeChecklists([])).toEqual({ done: 0, total: 0, pct: 0 });
  });
});

describe("canAddAnotherChecklist", () => {
  it("bez checklistu ne (první vzniká automaticky)", () => {
    expect(canAddAnotherChecklist([])).toBe(false);
  });
  it("s prázdným checklistem ne", () => {
    expect(canAddAnotherChecklist([cl([])])).toBe(false);
  });
  it("s aspoň jednou položkou ano", () => {
    expect(canAddAnotherChecklist([cl([false])])).toBe(true);
  });
});
