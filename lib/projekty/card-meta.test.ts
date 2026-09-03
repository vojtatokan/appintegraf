import { describe, expect, it } from "vitest";
import { cardMeta } from "./card-meta";

const user = (id: number) => ({ id, email: null, name: `U${id}`, image: null });
const base = {
  priority: null,
  labels: [],
  dueDate: null,
  completed: false,
  members: [],
  checklistDone: 0,
  checklistTotal: 0,
};

describe("cardMeta", () => {
  it("prázdná karta nemá žádná metadata", () => {
    const m = cardMeta(base);
    expect(m.metaCount).toBe(0);
    expect(m.flag).toBeNull();
    expect(m.labelStrip).toBeNull();
    expect(m.owner).toBeNull();
  });

  it("vlaječka jen pro URGENT a HIGH", () => {
    expect(cardMeta({ ...base, priority: "URGENT" }).flag).toBe("URGENT");
    expect(cardMeta({ ...base, priority: "HIGH" }).flag).toBe("HIGH");
    expect(cardMeta({ ...base, priority: "MEDIUM" }).flag).toBeNull();
    expect(cardMeta({ ...base, priority: "LOW" }).flag).toBeNull();
  });

  it("proužek = první štítek, title = všechny názvy", () => {
    const m = cardMeta({
      ...base,
      labels: [
        { label: { id: "a", name: "Finance", color: "#111" } },
        { label: { id: "b", name: "IT", color: "#222" } },
      ],
    });
    expect(m.labelStrip).toEqual({ color: "#111", title: "Finance, IT" });
  });

  it("zobrazí jen prvního člena a max 3 metadata (C3)", () => {
    const m = cardMeta({
      ...base,
      dueDate: "2026-09-10",
      checklistDone: 1,
      checklistTotal: 3,
      members: [{ user: user(1) }, { user: user(2) }],
    });
    expect(m.owner?.id).toBe(1);
    expect(m.checklist).toEqual({ done: 1, total: 3, complete: false });
    expect(m.due).toBeInstanceOf(Date);
    expect(m.metaCount).toBe(3);
  });

  it("checklist bez položek se nezobrazí", () => {
    expect(cardMeta({ ...base, checklistTotal: 0, checklistDone: 0 }).checklist).toBeNull();
  });
});
