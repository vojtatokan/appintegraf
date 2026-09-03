# Vlna 6 „Ubrat“ — implementační plán (modul Projekty)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stejné funkce modulu Projekty s třetinou ovládacích prvků: jeden řádek nad projektem, řídká karta, detail se šesti poli a „Více“, editor se šesti tlačítky, jeden checklist, sloupce bez barvy, modrý akcent, jedna sada shadcn komponent.

**Architecture:** Čistě UI vlna nad stávajícím datovým modelem. Jediná DB změna je ruční SQL migrace (drop `cover`, add `card_member.role`). Nová logika žije v čistých funkcích v `lib/projekty/` (testovatelné ve Vitest `environment: node`), komponenty je jen skládají. Každý task končí commitem na větvi `feat/modul-projekty` a typecheckem.

**Tech Stack:** Next.js 16 (App Router, RSC + REST routes), React 19, TypeScript strict, Tailwind 4 (`@theme inline` tokeny v `app/globals.css`), shadcn/ui (Radix), Tiptap 3, @dnd-kit, Vitest 4 (node env), Playwright.

**Spec:** `docs/MODUL_PROJEKTY_ZJEDNODUSENI_SPEC.md` (rozhodnutí D4–D8, D10–D12, D18–D21; pravidla C1–C14; §5, §6.4–6.9, §9–§11).

## Global Constraints

- Práce jen v modulu: `app/(dashboard)/projekty/`, `app/api/projekty/`, `components/projekty/`, `lib/projekty/`, `hooks/projekty/`. Sdílené soubory jen ty, které spec §11 vyjmenovává: `app/globals.css` (Task 1), `components/ui/` (Task 9), `prisma/schema.prisma` + `scripts/run-projekty-migration.mjs` (Task 2).
- Migrace **nikdy** přes `prisma migrate`; ruční SQL v `prisma/migrations/` + `npm run db:projekty-migrate`. Po změně `schema.prisma` spustit `npx prisma generate`. Nikdy `prisma db pull` / `prisma format`.
- Žádné `console.*` v komponentách a lib; chyby přes `toast.error` (sonner) v UI.
- UI texty česky. Slovník vlny 6 zůstává „karta / sloupec / board“ (přejmenování je D2 ve vlně 7).
- Komponenta max ~200 řádků; nad limit rozdělit.
- Vitest běží v `environment: node` → unit testy jen pro čisté funkce v `lib/projekty/`, žádný DOM.
- Před každým commitem: `npx tsc --noEmit && npm run lint && npm test`. Před koncem vlny: `npm run build`.
- Dev server Vojty na portu 3000: nikdy nezabíjet procesy podle jména. Vizuální kontrola vyžaduje běžící appintegraf (Vojta spustí `npm run dev -- -p 3100`, pokud je 3000 obsazený).
- Barvy: sytá barva jen pro stav (po termínu, dnes, hotovo, urgentní priorita) a akcent `projekty-accent`. `bg-primary` / `text-primary` / `ring-primary` (brand červená) se v modulu nepoužívá.
- Commity česky, na konci `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

---

## Mapa souborů

| Soubor | Akce | Odpovědnost |
|---|---|---|
| `app/globals.css` | modify | tokeny `--projekty-accent`, `--projekty-accent-soft` + `@theme inline` mapování |
| `prisma/migrations/20260903_projekty_simplify.sql` | create | drop `cover`, add `role` + backfill |
| `scripts/run-projekty-migration.mjs` | modify | přidat cestu k nové migraci |
| `prisma/schema.prisma` | modify | `Card.cover` pryč, `CardMember.role`, enum `CardMemberRole` |
| `lib/projekty/card-meta.ts` (+ `.test.ts`) | create | výpočet metadat karty (C3) |
| `lib/projekty/list-colors.ts` | modify | jen `value`, `dot`, `label` |
| `lib/projekty/card-filters.ts` (+ `.test.ts`) | modify | `countActiveFilters`, `filterChips` |
| `lib/projekty/checklist-summary.ts` (+ `.test.ts`) | create | `summarizeChecklists`, `canAddAnotherChecklist` |
| `components/projekty/PriorityChip.tsx` | modify | varianta `flag` |
| `components/projekty/boards/CardItem.tsx` | modify | řídká karta |
| `components/projekty/boards/BoardListColumn.tsx` | modify | sloupec bez výplně |
| `components/projekty/boards/BoardToolbar.tsx` | create | jeden řádek ovládání |
| `components/projekty/boards/BoardFilterPopover.tsx` | create | filtr v popoveru |
| `components/projekty/boards/BoardFilterChips.tsx` | create | chipy aktivních filtrů |
| `components/projekty/boards/BoardView.tsx` | modify | skládá toolbar, chipy, „Nový úkol“ |
| `components/projekty/boards/BoardViewTabs.tsx`, `BoardCardFilterBar.tsx`, `BoardGroupPicker.tsx` | delete | nahrazeno toolbarem |
| `components/projekty/boards/KanbanBoard.tsx` | modify | prop `quickAddListId` |
| `components/projekty/boards/CardDetailHeader.tsx` | create | hotovo + název + Termín/Přiřazení |
| `components/projekty/boards/CardDetailMore.tsx` | create | disclosure „Více“ |
| `components/projekty/boards/CardDetailContent.tsx` | modify | vrstva 1 / Více |
| `components/projekty/boards/CardDetailPanel.tsx` | modify | šířka 460 px |
| `components/projekty/editor/TiptapEditor.tsx` | modify | 6 tlačítek, bez variant |
| `components/projekty/editor/SlashMenuPopover.tsx`, `blocks.ts`, `block-previews.tsx`, `extensions/SlashCommand.ts` | delete | slash menu pryč |
| `components/projekty/boards/CardDescriptionEditor.tsx` | modify | bez `variant` |
| `components/projekty/boards/CardChecklistSection.tsx` | modify | jeden checklist, progress v hlavičce |
| `components/projekty/boards/ChecklistItemRow.tsx` | modify | řádek = checkbox + text + ⋯ |
| `components/projekty/boards/ChecklistItemMenu.tsx` | create | ⋯ menu položky |
| `components/ui/*` | modify/create | sjednocení shadcn (Task 9) |
| `components/projekty/ui/` | delete | po Task 9 |
| `components/projekty/CLAUDE.md`, `docs/MODUL_PROJEKTY_REDESIGN_RESEARCH.md` | modify | pravidla a stav |

---

### Task 1: Akcentový token modulu (D19)

**Files:**
- Modify: `app/globals.css` (`:root` blok cca ř. 75–120, `.dark` blok cca ř. 131–185, `@theme inline` ř. 41–70)

**Interfaces:**
- Produces: Tailwind utility třídy `bg-projekty-accent`, `text-projekty-accent`, `border-projekty-accent`, `ring-projekty-accent`, `bg-projekty-accent-soft` pro všechny další tasky.

- [ ] **Step 1: Přidat tokeny do `:root`**

Do bloku `:root {` v `app/globals.css` (za řádek `--radius: 0.625rem;`) přidat:

```css
  /* Modul Projekty — jediný akcent modulu (D19). Brand červená (--primary) se v modulu nepoužívá. */
  --projekty-accent: oklch(0.55 0.19 262);
  --projekty-accent-soft: oklch(0.94 0.03 262);
```

- [ ] **Step 2: Přidat tokeny do `.dark`**

Do bloku `.dark {` přidat:

```css
  --projekty-accent: oklch(0.72 0.14 262);
  --projekty-accent-soft: oklch(0.28 0.06 262);
```

- [ ] **Step 3: Namapovat do `@theme inline`**

Za řádek `--color-ring: var(--ring);` přidat:

```css
  --color-projekty-accent: var(--projekty-accent);
  --color-projekty-accent-soft: var(--projekty-accent-soft);
```

- [ ] **Step 4: Ověřit build CSS**

Run: `cd /Users/vojtatokan/Desktop/IG/appintegraf && npx tsc --noEmit && npm run lint`
Expected: bez chyb. (Build celé appky až na konci vlny.)

- [ ] **Step 5: Commit**

```bash
git add app/globals.css
git commit -m "feat(projekty): akcentový token modulu --projekty-accent (D19)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: Migrace — drop `cover`, add `card_member.role` (D21, D9 data)

**Files:**
- Create: `prisma/migrations/20260903_projekty_simplify.sql`
- Modify: `scripts/run-projekty-migration.mjs:14-18` (pole `SQL_PATHS`)
- Modify: `prisma/schema.prisma:1994-2022` (model `Card`), `:2047-2060` (model `CardMember`), enumy modulu (vedle `CardPriority`)
- Modify: `components/projekty/boards/CardItem.tsx:29` (typ), `components/projekty/boards/CardDetailContent.tsx:30` (typ)

**Interfaces:**
- Produces: Prisma enum `CardMemberRole { OWNER FOLLOWER }`, pole `CardMember.role` (default `FOLLOWER`). Vlna 7 na něm staví „Odpovídá“. `Card.cover` a `CardData.cover` / `FullCard.cover` přestávají existovat.

- [ ] **Step 1: Napsat SQL migraci**

`prisma/migrations/20260903_projekty_simplify.sql`:

```sql
-- Vlna 6 modulu Projekty (spec MODUL_PROJEKTY_ZJEDNODUSENI_SPEC.md §9).
-- Spouštět přes `npm run db:projekty-migrate` (NE přes prisma migrate).

-- D21: cover karty nemá UI a jde proti řídké kartě. Odstranit.
ALTER TABLE `projekty_card` DROP COLUMN `cover`;

-- D9: jedna odpovědná osoba + sledující. UI přijde ve vlně 7.
ALTER TABLE `projekty_card_member`
  ADD COLUMN `role` ENUM('OWNER', 'FOLLOWER') NOT NULL DEFAULT 'FOLLOWER';

-- Backfill: nejstarší přiřazení na kartě = OWNER. Opakované spuštění je no-op
-- (řádek, který už je OWNER, dostane znovu OWNER).
UPDATE `projekty_card_member` `m`
JOIN (
  SELECT `cardId`, MIN(`assignedAt`) AS `firstAt`
  FROM `projekty_card_member`
  GROUP BY `cardId`
) `f` ON `f`.`cardId` = `m`.`cardId` AND `f`.`firstAt` = `m`.`assignedAt`
SET `m`.`role` = 'OWNER';

-- Když má víc členů stejný assignedAt (backfill z vlny 5A nastavil createdAt karty
-- všem), zůstane OWNER jen ten s nejnižším userId.
UPDATE `projekty_card_member` `m`
JOIN (
  SELECT `cardId`, MIN(`userId`) AS `firstUser`
  FROM `projekty_card_member`
  WHERE `role` = 'OWNER'
  GROUP BY `cardId`
  HAVING COUNT(*) > 1
) `d` ON `d`.`cardId` = `m`.`cardId`
SET `m`.`role` = IF(`m`.`userId` = `d`.`firstUser`, 'OWNER', 'FOLLOWER');
```

- [ ] **Step 2: Zaregistrovat migraci ve skriptu**

V `scripts/run-projekty-migration.mjs` rozšířit `SQL_PATHS`:

```js
const SQL_PATHS = [
  join(root, "prisma", "migrations", "20260720_projekty_module.sql"),
  join(root, "prisma", "migrations", "20260721_projekty_personal_todo.sql"),
  join(root, "prisma", "migrations", "20260802_projekty_card_priority.sql"),
  join(root, "prisma", "migrations", "20260903_projekty_simplify.sql"),
];
```

Ověřit, jak skript řeší opakované spuštění (hledat `ER_DUP_FIELDNAME` / `ER_CANT_DROP_FIELD_OR_KEY` handling). Pokud skript při chybě „column doesn't exist“ padá, přidat do jeho seznamu ignorovaných kódů `ER_CANT_DROP_FIELD_OR_KEY` (1091) stejně, jako je tam pravděpodobně `ER_DUP_FIELDNAME` (1060).

- [ ] **Step 3: Upravit Prisma schema**

V modelu `Card` smazat řádek `cover       String?`. V modelu `CardMember` přidat:

```prisma
  // OWNER = odpovídá (jedna osoba), FOLLOWER = sleduje. UI ve vlně 7.
  role CardMemberRole @default(FOLLOWER)
```

Vedle `enum CardPriority` přidat:

```prisma
enum CardMemberRole {
  OWNER
  FOLLOWER
}
```

Run: `npx prisma generate`
Expected: `Generated Prisma Client`.

- [ ] **Step 4: Spustit migraci na lokální DB**

Run: `npm run db:projekty-migrate`
Expected: bez chyby; `SELECT COUNT(*) FROM projekty_card_member WHERE role='OWNER'` = počet karet s aspoň jedním členem. Ověřit přes `npx prisma studio` nebo rychlý `node -e` s mysql2.

- [ ] **Step 5: Odstranit `cover` z typů a UI**

`components/projekty/boards/CardItem.tsx`: smazat `cover: string | null;` z `CardData` a blok `{card.cover ? (<img …/>) : null}` (ř. 71–79).
`components/projekty/boards/CardDetailContent.tsx`: smazat `cover: string | null;` z `FullCard`.

Run: `grep -rn "cover" app/api/projekty app/\(dashboard\)/projekty components/projekty lib/projekty` a odstranit každý zbylý výskyt (select v RSC dotazech, Zod validátory).

- [ ] **Step 6: Typecheck, testy, commit**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: PASS.

```bash
git add prisma/migrations/20260903_projekty_simplify.sql scripts/run-projekty-migration.mjs prisma/schema.prisma components/projekty app/api/projekty "app/(dashboard)/projekty" lib/projekty
git commit -m "feat(projekty): migrace vlny 6 — drop Card.cover, CardMember.role (D21, D9)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: Řídká kanban karta (D7, D8)

**Files:**
- Create: `lib/projekty/card-meta.ts`, `lib/projekty/card-meta.test.ts`
- Modify: `components/projekty/PriorityChip.tsx`
- Modify: `components/projekty/boards/CardItem.tsx:45-151`

**Interfaces:**
- Produces: `cardMeta(card: CardMetaInput): CardMeta` — jediné místo, které rozhoduje, co karta ukáže. `PriorityChip` dostává `variant="flag"`.

- [ ] **Step 1: Napsat failing test**

`lib/projekty/card-meta.test.ts`:

```ts
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
```

- [ ] **Step 2: Spustit test, ověřit selhání**

Run: `npx vitest run lib/projekty/card-meta.test.ts`
Expected: FAIL — `Cannot find module './card-meta'`.

- [ ] **Step 3: Implementovat `card-meta.ts`**

```ts
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
```

- [ ] **Step 4: Spustit test, ověřit průchod**

Run: `npx vitest run lib/projekty/card-meta.test.ts`
Expected: PASS (5 testů).

- [ ] **Step 5: Přidat `variant="flag"` do `PriorityChip`**

V `components/projekty/PriorityChip.tsx` rozšířit typ `variant?: "chip" | "dot" | "flag"` a před `if (variant === "dot")` vložit:

```tsx
  if (variant === "flag") {
    if (priority !== "URGENT" && priority !== "HIGH") return null;
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center",
          priority === "URGENT" ? "text-red-600 dark:text-red-400" : "text-orange-600 dark:text-orange-400",
          className,
        )}
        title={`Priorita: ${label}`}
      >
        <Flag className="size-3" strokeWidth={2} aria-hidden />
        <span className="sr-only">{`Priorita: ${label}`}</span>
      </span>
    );
  }
```

a nahoře `import { Flag } from "lucide-react";`.

- [ ] **Step 6: Přepsat `CardItemBody` v `CardItem.tsx`**

Nahradit celé tělo funkce `CardItemBody` (ř. 45–151) tímto:

```tsx
function CardItemBody({
  card,
  boardId,
  asLink,
}: {
  card: CardData;
  boardId: string;
  asLink: boolean;
}) {
  const meta = cardMeta(card);
  const hasMeta = meta.flag !== null || meta.metaCount > 0;

  const content = (
    <div className="relative py-2 pl-3.5 pr-3">
      {meta.labelStrip ? (
        <span
          className="absolute inset-y-0 left-0 w-[3px]"
          style={{ backgroundColor: meta.labelStrip.color }}
          title={meta.labelStrip.title}
          aria-label={`Štítky: ${meta.labelStrip.title}`}
        />
      ) : null}

      <div className="flex items-start gap-1.5">
        {card.completed ? (
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
        ) : null}
        <div
          className={cn(
            "flex-1 text-[13px] leading-snug",
            card.completed ? "text-muted-foreground/70 line-through" : "text-foreground",
          )}
        >
          {card.title}
        </div>
      </div>

      {hasMeta ? (
        <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
          <PriorityChip priority={card.priority} variant="flag" />
          {meta.due ? (
            <DueDateBadge due={meta.due} completed={card.completed} className="-my-0.5" />
          ) : null}
          {meta.checklist ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 tabular-nums",
                meta.checklist.complete && "text-emerald-600 dark:text-emerald-400",
              )}
            >
              <CheckSquare className="size-3" aria-hidden />
              {`${meta.checklist.done}/${meta.checklist.total}`}
            </span>
          ) : null}
          {meta.owner ? (
            <span className="ml-auto inline-flex items-center">
              <UserAvatar user={meta.owner} size="xs" />
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  if (asLink) {
    return (
      <Link
        href={`/projekty/boards/${boardId}?card=${card.id}`}
        draggable={false}
        className="block overflow-hidden rounded-lg"
      >
        {content}
      </Link>
    );
  }
  return <div className="block overflow-hidden rounded-lg">{content}</div>;
}
```

Importy: přidat `import { cardMeta } from "@/lib/projekty/card-meta";`, odstranit `LabelChip` import (pokud už ho nic jiného v souboru nepoužívá).

V `CardItem` (ř. 206–212) změnit třídu vybrané karty z `border-primary ring-1 ring-primary` na `border-projekty-accent ring-1 ring-projekty-accent`.

- [ ] **Step 7: Typecheck, testy, commit**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: PASS.

```bash
git add lib/projekty/card-meta.ts lib/projekty/card-meta.test.ts components/projekty/PriorityChip.tsx components/projekty/boards/CardItem.tsx
git commit -m "feat(projekty): řídká kanban karta — název + max 3 metadata, štítek jako proužek (D7, D8)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: Sloupec bez barevného pozadí (D5)

**Files:**
- Modify: `lib/projekty/list-colors.ts`
- Modify: `components/projekty/boards/BoardListColumn.tsx:96-217, 223-251`
- Modify: `components/projekty/boards/BoardListMenu.tsx:112` (swatch používá `c.dot` — ověřit)

**Interfaces:**
- Produces: `ListColor = { value; dot; label }`; `findListColor`, `defaultListColor`, `LIST_COLOR_VALUES` beze změny signatury.

- [ ] **Step 1: Zjednodušit `list-colors.ts`**

Typ `ListColor` zredukovat na `{ value: string; dot: string; label: string }` a z každé položky `LIST_PRESET_COLORS` smazat `bgTint`, `pillBg`, `ctaText`, `ctaTextDark`. Ostatní funkce zůstávají.

Run: `npx tsc --noEmit`
Expected: chyby jen v `BoardListColumn.tsx` (odkazy na smazaná pole) — to opravuje další krok. Pokud se objeví jinde (`BoardListMenu`, `lib/projekty/*.test.ts`), opravit tam stejně (jen `dot`).

- [ ] **Step 2: Přepsat kořen sloupce v `BoardListColumn`**

Nahradit `style={{ ...style, backgroundColor: …, "--list-pill-bg": … }}` prostým `style={style}` a třídy kořene:

```tsx
      className={cn(
        "group/list flex h-full w-[272px] shrink-0 snap-start flex-col rounded-lg p-1 transition-colors duration-150 motion-reduce:transition-none",
        isDraggingCardOverThisList && "bg-projekty-accent-soft",
      )}
```

Hlavička (ř. 114–164): výška `h-9`, název `text-[13px] font-medium` (místo `text-sm font-semibold tracking-tight`), counter:

```tsx
        <span className="ml-0.5 text-xs tabular-nums text-muted-foreground">{totalCount}</span>
```

Řádek „N dokončeno“ (ř. 191–195) změnit na `text-[11px] text-muted-foreground`. Tlačítko „Nová karta“ (ř. 197–206):

```tsx
          <button
            type="button"
            onClick={() => setQuickAddOpen(true)}
            onPointerDown={(e) => e.stopPropagation()}
            className="mt-1 flex h-8 w-full items-center gap-1.5 rounded-md px-2 text-[13px] text-muted-foreground transition-colors duration-150 hover:bg-card hover:text-foreground motion-reduce:transition-none"
          >
            <Plus className="size-3.5" strokeWidth={2} /> Nová karta
          </button>
```

Mezeru mezi kartami `gap-1.5` ponechat.

- [ ] **Step 3: Přepsat `BoardListColumnDragOverlay`**

```tsx
export function BoardListColumnDragOverlay({ list }: { list: ListData }) {
  const colorPreset = findListColor(list.color);
  return (
    <div className="flex w-[272px] flex-col rounded-lg border border-border bg-card p-1 shadow-lg rotate-1">
      <div className="flex h-9 items-center gap-2 px-1">
        <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: colorPreset.dot }} aria-hidden />
        <h3 className="truncate text-[13px] font-medium text-foreground">{list.name}</h3>
        <span className="ml-0.5 text-xs tabular-nums text-muted-foreground">{list.cards.length}</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Typecheck, testy, commit**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: PASS.

```bash
git add lib/projekty/list-colors.ts components/projekty/boards/BoardListColumn.tsx components/projekty/boards/BoardListMenu.tsx
git commit -m "feat(projekty): sloupce bez barevného pozadí, barva jen jako tečka (D5)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 5: Jeden řádek ovládání nad projektem (D4, D6)

**Files:**
- Modify: `lib/projekty/card-filters.ts`, `lib/projekty/card-filters.test.ts`
- Create: `components/projekty/boards/BoardToolbar.tsx`, `BoardFilterPopover.tsx`, `BoardFilterChips.tsx`
- Modify: `components/projekty/boards/BoardView.tsx:110-181`, `components/projekty/boards/KanbanBoard.tsx` (nová prop), `components/projekty/boards/BoardListColumn.tsx` (prop `quickAddOpen` z venku)
- Delete: `components/projekty/boards/BoardViewTabs.tsx`, `BoardCardFilterBar.tsx`, `BoardGroupPicker.tsx`

**Interfaces:**
- Consumes: `CardFilters`, `parseCardFilters`, `serializeCardFilters` z `card-filters.ts`; `parseBoardView`, `parseBoardGroup` z `board-view.ts`.
- Produces: `countActiveFilters(f: CardFilters): number`; `filterChips(f, ctx): FilterChip[]` kde `FilterChip = { key: string; label: string; clear: Partial<CardFilters> }`; komponenty `BoardToolbar({ board, stats, onNewCard })`, `BoardFilterPopover({ members, labels })`, `BoardFilterChips({ members, labels })`; `KanbanBoard` prop `quickAddListId?: string | null` + `onQuickAddHandled?: () => void`.

- [ ] **Step 1: Failing test pro pomocné funkce filtrů**

Do `lib/projekty/card-filters.test.ts` přidat:

```ts
import { countActiveFilters, filterChips, type CardFilters } from "./card-filters";

const none: CardFilters = { completed: "any" };

describe("countActiveFilters", () => {
  it("bez filtrů = 0", () => {
    expect(countActiveFilters(none)).toBe(0);
  });
  it("každý druh filtru počítá 1", () => {
    expect(
      countActiveFilters({
        q: "abc",
        memberIds: ["1", "2"],
        labelIds: ["l1"],
        priorities: ["URGENT"],
        dueRange: "today",
        completed: "false",
      }),
    ).toBe(6);
  });
});

describe("filterChips", () => {
  const ctx = {
    members: [{ id: 1, email: null, name: "Vojta", image: null }],
    labels: [{ id: "l1", name: "Finance", color: "#111" }],
  };
  it("vrátí chip za člena, štítek, termín a hotové s clear patchem", () => {
    const chips = filterChips(
      { memberIds: ["1"], labelIds: ["l1"], dueRange: "overdue", completed: "false" },
      ctx,
    );
    expect(chips.map((c) => c.label)).toEqual(["Vojta", "Finance", "Po termínu", "Bez hotových"]);
    expect(chips[0].clear).toEqual({ memberIds: undefined });
    expect(chips[3].clear).toEqual({ completed: "any" });
  });
  it("neznámé id člena zobrazí jako „?“", () => {
    expect(filterChips({ memberIds: ["99"], completed: "any" }, ctx)[0].label).toBe("?");
  });
});
```

(Pokud `CardFilters.completed` není povinné pole, upravit `none` podle skutečného typu — ověřit v `card-filters.ts`.)

- [ ] **Step 2: Spustit test, ověřit selhání**

Run: `npx vitest run lib/projekty/card-filters.test.ts`
Expected: FAIL — `countActiveFilters is not a function`.

- [ ] **Step 3: Implementovat v `card-filters.ts`**

Na konec souboru přidat:

```ts
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
```

Import `PRIORITY_LABELS` z `./priority` (ověřit, že `card-filters.ts` už `priority.ts` importuje; jinak přidat).

- [ ] **Step 4: Spustit test, ověřit průchod**

Run: `npx vitest run lib/projekty/card-filters.test.ts`
Expected: PASS.

- [ ] **Step 5: Vytvořit `BoardFilterPopover.tsx`**

```tsx
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/projekty/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/projekty/ui/popover";
import { UserAvatar } from "@/components/projekty/UserAvatar";
import {
  countActiveFilters,
  parseCardFilters,
  serializeCardFilters,
  type CardFilters,
} from "@/lib/projekty/card-filters";
import { parseBoardGroup, parseBoardView, type BoardGroupBy } from "@/lib/projekty/board-view";
import { cn } from "@/lib/projekty/utils";

type UserLite = { id: number; email: string | null; name: string | null; image: string | null };
type Label = { id: string; name: string; color: string };

const GROUP_LABELS: Record<BoardGroupBy, string> = {
  list: "Sloupec",
  assignee: "Řešitel",
  due: "Termín",
  priority: "Priorita",
};
const DUE_OPTIONS = [
  ["overdue", "Po termínu"],
  ["today", "Dnes"],
  ["week", "Tento týden"],
  ["none", "Bez termínu"],
] as const;

function Row({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[13px] transition-colors duration-150 hover:bg-muted motion-reduce:transition-none",
        on && "text-projekty-accent",
      )}
    >
      {children}
      {on ? <Check className="ml-auto size-3.5" aria-hidden /> : null}
    </button>
  );
}

function Title({ children }: { children: React.ReactNode }) {
  return <p className="px-2 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{children}</p>;
}

/** Jediné tlačítko „Filtr“ (D4). Obsah: Kdo · Štítek · Termín · Skrýt hotové · Seskupit (jen Seznam). */
export function BoardFilterPopover({ members, labels }: { members: UserLite[]; labels: Label[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = parseCardFilters(searchParams);
  const view = parseBoardView(searchParams);
  const groupBy = parseBoardGroup(searchParams);
  const active = countActiveFilters(filters);

  function update(patch: Partial<CardFilters>) {
    const next = { ...filters, ...patch };
    const sp = new URLSearchParams(searchParams.toString());
    for (const k of ["q", "members", "labels", "due", "completed", "priority"]) sp.delete(k);
    for (const [k, v] of serializeCardFilters(next).entries()) sp.set(k, v);
    router.replace(`${pathname}${sp.toString() ? `?${sp.toString()}` : ""}`);
  }
  function toggleIn(key: "memberIds" | "labelIds", id: string) {
    const ids = new Set(filters[key] ?? []);
    if (ids.has(id)) ids.delete(id);
    else ids.add(id);
    update({ [key]: ids.size ? Array.from(ids) : undefined });
  }
  function setGroup(value: BoardGroupBy) {
    const sp = new URLSearchParams(searchParams.toString());
    if (value === "list") sp.delete("group");
    else sp.set("group", value);
    router.replace(`${pathname}${sp.size ? `?${sp}` : ""}`);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={active ? "outline" : "ghost"} size="sm" aria-label="Filtr">
          <SlidersHorizontal className="size-3.5" />
          Filtr{active ? <span className="tabular-nums">{active}</span> : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-1" align="end">
        <Title>Kdo</Title>
        {members.map((u) => (
          <Row key={u.id} on={Boolean(filters.memberIds?.includes(String(u.id)))} onClick={() => toggleIn("memberIds", String(u.id))}>
            <UserAvatar user={u} className="size-5" />
            <span className="truncate">{u.name ?? u.email ?? "—"}</span>
          </Row>
        ))}
        {labels.length > 0 ? (
          <>
            <Title>Štítek</Title>
            {labels.map((l) => (
              <Row key={l.id} on={Boolean(filters.labelIds?.includes(l.id))} onClick={() => toggleIn("labelIds", l.id)}>
                <span className="size-2.5 rounded-sm" style={{ backgroundColor: l.color }} aria-hidden />
                <span className="truncate">{l.name}</span>
              </Row>
            ))}
          </>
        ) : null}
        <Title>Termín</Title>
        {DUE_OPTIONS.map(([value, label]) => (
          <Row key={value} on={filters.dueRange === value} onClick={() => update({ dueRange: filters.dueRange === value ? undefined : value })}>
            {label}
          </Row>
        ))}
        <div className="my-1 h-px bg-border" />
        <Row on={filters.completed === "false"} onClick={() => update({ completed: filters.completed === "false" ? "any" : "false" })}>
          Skrýt hotové
        </Row>
        {view === "list" ? (
          <>
            <Title>Seskupit</Title>
            {(Object.keys(GROUP_LABELS) as BoardGroupBy[]).map((g) => (
              <Row key={g} on={groupBy === g} onClick={() => setGroup(g)}>
                {GROUP_LABELS[g]}
              </Row>
            ))}
          </>
        ) : null}
        {active > 0 ? (
          <>
            <div className="my-1 h-px bg-border" />
            <Row
              on={false}
              onClick={() =>
                update({ q: undefined, memberIds: undefined, labelIds: undefined, priorities: undefined, dueRange: undefined, completed: "any" })
              }
            >
              <X className="size-3.5" aria-hidden /> Zrušit filtry
            </Row>
          </>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
```

Filtr priority z popoveru záměrně vypadává (D8: priorita jde pod „Více“); URL parametr `?priority=` zůstává funkční přes `parseCardFilters` a chipy.

- [ ] **Step 6: Vytvořit `BoardFilterChips.tsx`**

```tsx
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { filterChips, parseCardFilters, serializeCardFilters, type CardFilters } from "@/lib/projekty/card-filters";

type UserLite = { id: number; email: string | null; name: string | null; image: string | null };
type Label = { id: string; name: string; color: string };

/** Řádek chipů aktivních filtrů pod toolbarem. Bez filtrů se nevykreslí (D4). */
export function BoardFilterChips({ members, labels }: { members: UserLite[]; labels: Label[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = parseCardFilters(searchParams);
  const chips = filterChips(filters, { members, labels });
  if (chips.length === 0) return null;

  function clear(patch: Partial<CardFilters>) {
    const next = { ...filters, ...patch };
    const sp = new URLSearchParams(searchParams.toString());
    for (const k of ["q", "members", "labels", "due", "completed", "priority"]) sp.delete(k);
    for (const [k, v] of serializeCardFilters(next).entries()) sp.set(k, v);
    router.replace(`${pathname}${sp.toString() ? `?${sp.toString()}` : ""}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 px-5 pt-2">
      {chips.map((c) => (
        <span
          key={c.key}
          className="inline-flex h-6 items-center gap-1 rounded-full border border-projekty-accent bg-projekty-accent-soft px-2 text-xs text-projekty-accent"
        >
          {c.label}
          <button type="button" onClick={() => clear(c.clear)} aria-label={`Zrušit filtr ${c.label}`} className="rounded-full hover:opacity-70">
            <X className="size-3" />
          </button>
        </span>
      ))}
    </div>
  );
}
```

- [ ] **Step 7: Vytvořit `BoardToolbar.tsx`**

```tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Archive, ArrowLeft, CalendarDays, Columns, List as ListIcon, MoreHorizontal, Plus, Settings } from "lucide-react";
import { Button } from "@/components/projekty/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/projekty/ui/dropdown-menu";
import { parseBoardView, type BoardViewType } from "@/lib/projekty/board-view";
import { cn } from "@/lib/projekty/utils";
import { BoardFilterPopover } from "./BoardFilterPopover";

type UserLite = { id: number; email: string | null; name: string | null; image: string | null };
type Label = { id: string; name: string; color: string };

const VIEWS: { value: BoardViewType; label: string; Icon: typeof Columns }[] = [
  { value: "kanban", label: "Nástěnka", Icon: Columns },
  { value: "list", label: "Seznam", Icon: ListIcon },
  { value: "calendar", label: "Kalendář", Icon: CalendarDays },
];

export type BoardStats = { done: number; total: number; overdue: number };

/** Jediný řádek ovládání projektu (D4): zpět · název · stav · pohledy · Filtr · Nová karta · ⋯ */
export function BoardToolbar({
  board,
  stats,
  members,
  labels,
  onNewCard,
  onArchiveBoard,
}: {
  board: { id: string; name: string; background: string | null };
  stats: BoardStats;
  members: UserLite[];
  labels: Label[];
  onNewCard: () => void;
  onArchiveBoard: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = parseBoardView(searchParams);

  function setView(value: BoardViewType) {
    const sp = new URLSearchParams(searchParams.toString());
    if (value === "kanban") sp.delete("view");
    else sp.set("view", value);
    if (value !== "calendar") sp.delete("month");
    if (value !== "list") sp.delete("group");
    router.replace(`${pathname}${sp.toString() ? `?${sp.toString()}` : ""}`);
  }

  return (
    <div className="flex h-[52px] shrink-0 items-center gap-2 border-b border-border bg-card px-3 sm:px-5">
      <Button variant="ghost" size="icon-sm" asChild aria-label="Zpět na projekty">
        <Link href="/projekty/boards"><ArrowLeft className="size-4" /></Link>
      </Button>
      <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: board.background ?? "#64748b" }} aria-hidden />
      <h1 className="truncate text-[15px] font-semibold tracking-tight text-foreground">{board.name}</h1>
      <span className="hidden text-xs tabular-nums text-muted-foreground md:inline">
        <b className="font-medium text-foreground">{stats.done}</b>/{stats.total} hotovo
        {stats.overdue > 0 ? (
          <> · <span className="text-red-700 dark:text-red-400">{stats.overdue} po termínu</span></>
        ) : null}
      </span>
      <span className="flex-1" />

      <div role="tablist" aria-label="Přepínač pohledu" className="flex items-center gap-0.5 rounded-lg border border-border bg-muted/40 p-0.5">
        {VIEWS.map(({ value, label, Icon }) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={current === value}
            onClick={() => setView(value)}
            className={cn(
              "inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[13px] transition-colors duration-150 motion-reduce:transition-none",
              current === value ? "bg-card font-medium text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-3.5" strokeWidth={1.75} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      <BoardFilterPopover members={members} labels={labels} />

      <Button size="sm" onClick={onNewCard} className="bg-projekty-accent text-white hover:bg-projekty-accent/90">
        <Plus className="size-3.5" /> <span className="hidden sm:inline">Nová karta</span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Další akce"><MoreHorizontal className="size-4" /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem asChild>
            <Link href={`/projekty/boards/${board.id}/settings`}><Settings className="size-4" /> Nastavení boardu</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={onArchiveBoard} className="text-red-700 focus:text-red-700 dark:text-red-400">
            <Archive className="size-4" /> Archivovat board
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
```

„Archiv karet“ a „Uložit jako šablonu“ jsou vlna 8; do menu se nepřidávají (C8 max 5). `onArchiveBoard` volá stávající logiku z `BoardDangerZone` — pokud tam je jen formulář bez exportované funkce, `onArchiveBoard` v BoardView jen `router.push(`/projekty/boards/${board.id}/settings#danger`)`.

- [ ] **Step 8: Napojit v `BoardView.tsx`**

Nahradit `<header …>…</header>`, `<BoardViewTabs />` a `<BoardCardFilterBar … />` (ř. 116–138):

```tsx
        <BoardToolbar
          board={board}
          stats={boardStats(lists)}
          members={allMembers}
          labels={board.labels}
          onNewCard={handleNewCard}
          onArchiveBoard={() => router.push(`/projekty/boards/${board.id}/settings`)}
        />
        <BoardFilterChips members={allMembers} labels={board.labels} />
```

Do `BoardViewInner` přidat:

```tsx
  const [quickAddListId, setQuickAddListId] = useState<string | null>(null);

  function handleNewCard() {
    const first = lists[0];
    if (!first) {
      toast.info("Nejdřív přidej sloupec.");
      return;
    }
    const view = parseBoardView(searchParams);
    if (view !== "kanban") {
      const sp = new URLSearchParams(searchParams.toString());
      sp.delete("view");
      router.replace(`${pathname}${sp.toString() ? `?${sp.toString()}` : ""}`);
    }
    setQuickAddListId(first.id);
  }
```

a čistou funkci (v `BoardView.tsx` nad komponentou, nebo v `lib/projekty/board-stats.ts` s testem, pokud zbývá čas):

```ts
function boardStats(lists: ListData[]): BoardStats {
  const cards = lists.flatMap((l) => l.cards);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return {
    total: cards.length,
    done: cards.filter((c) => c.completed).length,
    overdue: cards.filter((c) => !c.completed && c.dueDate && new Date(c.dueDate) < today).length,
  };
}
```

`KanbanBoard` dostane `quickAddListId={quickAddListId}` a `onQuickAddHandled={() => setQuickAddListId(null)}`; KanbanBoard je předá do `BoardListColumn` jako `quickAddOpen={list.id === quickAddListId}` a `onQuickAddOpenChange`. V `BoardListColumn` nahradit lokální `useState(false)` pro `quickAddOpen` řízeným stavem s fallbackem:

```tsx
  const [internalOpen, setInternalOpen] = useState(false);
  const quickAddOpen = quickAddOpenProp ?? internalOpen;
  function setQuickAddOpen(next: boolean) {
    setInternalOpen(next);
    onQuickAddOpenChange?.(next);
  }
```

Importy: odstranit `Settings`, `Link`, `BoardViewTabs`, `BoardCardFilterBar`; přidat `BoardToolbar`, `BoardFilterChips`, `type BoardStats`.

- [ ] **Step 9: Smazat staré komponenty**

```bash
git rm components/projekty/boards/BoardViewTabs.tsx components/projekty/boards/BoardCardFilterBar.tsx components/projekty/boards/BoardGroupPicker.tsx
```

Run: `grep -rn "BoardViewTabs\|BoardCardFilterBar\|BoardGroupPicker" components app lib`
Expected: žádný výskyt.

- [ ] **Step 10: Typecheck, testy, commit**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: PASS.

```bash
git add components/projekty/boards lib/projekty/card-filters.ts lib/projekty/card-filters.test.ts
git commit -m "feat(projekty): jeden řádek ovládání nad boardem, filtr v popoveru, chipy (D4, D6)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 6: Detail karty — vrstva 1 a „Více“ (D10)

**Files:**
- Create: `components/projekty/boards/CardDetailHeader.tsx`, `components/projekty/boards/CardDetailMore.tsx`
- Modify: `components/projekty/boards/CardDetailContent.tsx` (celý), `components/projekty/boards/CardDetailPanel.tsx:156` (šířka), `components/projekty/boards/CardDueDatePicker.tsx` (vzhled chipu, jen třídy)

**Interfaces:**
- Consumes: `FullCard`, `onPatch`, `onCardChange` (beze změny).
- Produces: `CardDetailHeader({ card, onPatch, onCardChange })`, `CardDetailMore({ card, currentUserId, onPatch, onCardChange })`. `CardDetailContent` zůstává vstupním bodem pro panel i stránku.

- [ ] **Step 1: Vytvořit `CardDetailHeader.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/projekty/utils";
import { CardDueDatePicker } from "./CardDueDatePicker";
import { CardMembersPicker } from "./CardMembersPicker";
import type { FullCard } from "./CardDetailContent";

/** Vrstva 1 detailu: hotovo + název + drobek + Termín + Přiřazení (D10). */
export function CardDetailHeader({
  card,
  onPatch,
  onCardChange,
}: {
  card: FullCard;
  onPatch: (patch: Record<string, unknown>) => Promise<void>;
  onCardChange: (updater: (prev: FullCard) => FullCard) => void;
}) {
  const [title, setTitle] = useState(card.title);
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setTitle(card.title);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card.id]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [title]);

  async function saveTitle() {
    if (title.trim() === card.title || !title.trim()) {
      setTitle(card.title);
      return;
    }
    setSaving(true);
    await onPatch({ title: title.trim() });
    setSaving(false);
  }

  const boardMembers = card.list.board.members.map((m) => m.user);

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => void onPatch({ completed: !card.completed })}
          aria-label={card.completed ? "Označit jako nehotové" : "Označit jako hotové"}
          className={cn(
            "mt-1 grid size-[22px] shrink-0 place-items-center rounded-full border-[1.5px] transition-colors duration-150 motion-reduce:transition-none",
            card.completed
              ? "border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500"
              : "border-border text-transparent hover:border-projekty-accent",
          )}
        >
          <Check className="size-3" strokeWidth={3} />
        </button>
        <div className="min-w-0 flex-1">
          <textarea
            ref={ref}
            rows={1}
            value={title}
            disabled={saving}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => void saveTitle()}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.currentTarget.blur();
              }
            }}
            className={cn(
              "w-full resize-none bg-transparent text-[17px] font-semibold leading-snug tracking-tight text-foreground outline-none",
              card.completed && "text-muted-foreground line-through",
            )}
          />
          <p className="text-xs text-muted-foreground">
            {card.list.name}
            {card.completed ? " · hotovo" : ""}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-[88px_1fr] items-center gap-x-2 gap-y-1">
        <dt className="text-xs text-muted-foreground">Termín</dt>
        <dd>
          <CardDueDatePicker
            value={card.dueDate ? new Date(card.dueDate) : null}
            completed={card.completed}
            onChange={(date) => void onPatch({ dueDate: date ? date.toISOString() : null })}
          />
        </dd>
        <dt className="text-xs text-muted-foreground">Přiřazení</dt>
        <dd>
          <CardMembersPicker
            cardId={card.id}
            assignedUserIds={card.members.map((m) => m.userId)}
            boardMembers={boardMembers}
            onChange={(newIds) =>
              onCardChange((prev) => ({
                ...prev,
                members: newIds.flatMap((uid) => {
                  const existing = prev.members.find((m) => m.userId === uid);
                  if (existing) return [existing];
                  const user = boardMembers.find((u) => u.id === uid);
                  return user ? [{ userId: uid, user }] : [];
                }),
              }))
            }
          />
        </dd>
      </dl>
    </div>
  );
}
```

(„Přiřazení“ se ve vlně 7 stane „Odpovídá“ přes `OwnerPicker`; teď zůstává multi picker.)

- [ ] **Step 2: Vytvořit `CardDetailMore.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/projekty/utils";
import { CardLabelsPicker } from "./CardLabelsPicker";
import { CardPriorityPicker } from "./CardPriorityPicker";
import { CardAttachmentsSection } from "./CardAttachmentsSection";
import { CardActivityFeed } from "./CardActivityFeed";
import type { FullCard } from "./CardDetailContent";

const STORAGE_KEY = "projekty-card-more-open";

/** Vrstva 2 detailu (D10): štítky, priorita, přílohy, historie. Stav rozbalení si pamatuje prohlížeč. */
export function CardDetailMore({
  card,
  currentUserId,
  onPatch,
  onCardChange,
}: {
  card: FullCard;
  currentUserId: number;
  onPatch: (patch: Record<string, unknown>) => Promise<void>;
  onCardChange: (updater: (prev: FullCard) => FullCard) => void;
}) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    try {
      setOpen(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      /* private mode */
    }
  }, []);
  function toggle() {
    const next = !open;
    setOpen(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    } catch {
      /* private mode */
    }
  }

  const boardLabels = card.list.board.labels;

  return (
    <div>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="flex h-9 w-full items-center gap-1.5 border-y border-border text-[13px] text-muted-foreground transition-colors duration-150 hover:text-foreground motion-reduce:transition-none"
      >
        <ChevronRight className={cn("size-4 transition-transform duration-150", open && "rotate-90")} aria-hidden />
        Více
        <span className="text-xs text-muted-foreground/70">štítky, priorita, přílohy, historie</span>
      </button>

      {open ? (
        <div className="space-y-5 pt-4">
          <dl className="grid grid-cols-[88px_1fr] items-center gap-x-2 gap-y-1">
            <dt className="text-xs text-muted-foreground">Štítky</dt>
            <dd>
              <CardLabelsPicker
                cardId={card.id}
                assignedLabelIds={card.labels.map((l) => l.labelId)}
                boardLabels={boardLabels}
                onChange={(newIds) =>
                  onCardChange((prev) => ({
                    ...prev,
                    labels: newIds.flatMap((lid) => {
                      const existing = prev.labels.find((l) => l.labelId === lid);
                      if (existing) return [existing];
                      const label = boardLabels.find((l) => l.id === lid);
                      return label ? [{ labelId: lid, label }] : [];
                    }),
                  }))
                }
              />
            </dd>
            <dt className="text-xs text-muted-foreground">Priorita</dt>
            <dd>
              <CardPriorityPicker value={card.priority} onChange={(priority) => void onPatch({ priority })} />
            </dd>
          </dl>
          <section>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Přílohy</h3>
            <CardAttachmentsSection cardId={card.id} currentUserId={currentUserId} />
          </section>
          <section>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Historie</h3>
            <CardActivityFeed cardId={card.id} />
          </section>
        </div>
      ) : null}
    </div>
  );
}
```

Pokud `CardAttachmentsSection` / `CardActivityFeed` vykreslují vlastní nadpis („Přílohy“, „Aktivita“), odstranit ho tam (přijmout prop `hideTitle` nebo nadpis smazat), aby nebyl dvakrát.

- [ ] **Step 3: Přepsat `CardDetailContent.tsx`**

Nahradit vše od `return (` po konec komponenty:

```tsx
  return (
    <div className="space-y-5">
      <CardDetailHeader card={card} onPatch={onPatch} onCardChange={onCardChange} />

      <section>
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Popis</h3>
        <CardDescriptionEditor
          value={card.description ?? ""}
          onSave={async (newValue) => {
            await onPatch({ description: newValue || null });
          }}
          cardId={card.id}
        />
      </section>

      <section>
        <CardChecklistSection cardId={card.id} checklists={card.checklists ?? []} boardMembers={boardMembersForPicker} />
      </section>

      <section>
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Komentáře</h3>
        <CardCommentsSection cardId={card.id} currentUserId={currentUserId} />
      </section>

      <CardDetailMore card={card} currentUserId={currentUserId} onPatch={onPatch} onCardChange={onCardChange} />

      <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
        <span>{card.number}</span>
        <Button variant="ghost" size="sm" onClick={onArchive}>
          <Archive className="size-3.5" /> Archivovat
        </Button>
      </div>
    </div>
  );
```

Odstranit z komponenty stav `title`/`savingTitle` a `handleTitleBlur` (přesunuto do headeru), importy `Input`, `Checkbox`, `CardDueDatePicker`, `CardPriorityPicker`, `CardMembersPicker`, `CardLabelsPicker`, `CardAttachmentsSection`, `CardActivityFeed`. Ponechat `boardMembersForPicker`. Pokud `CardCommentsSection` má vlastní nadpis, odstranit ho (stejně jako v kroku 2).

- [ ] **Step 4: Šířka panelu**

`CardDetailPanel.tsx:156`: `className="flex w-full flex-col gap-0 p-0 sm:max-w-[460px]"`. Hlavička panelu (ř. 158–196) ponechat; `SheetTitle` číslo karty zmenšit na `text-xs tracking-wider text-muted-foreground` (bez uppercase + font-semibold), protože číslo je nově i v patičce obsahu — v patičce ho tedy vynechat, pokud je panel (ponechat jen na plné stránce): jednodušší je číslo z patičky v kroku 3 odstranit úplně a nechat je jen v hlavičce panelu a v hlavičce stránky. Rozhodnutí: **odstranit z patičky**.

- [ ] **Step 5: Chip vzhled pro `CardDueDatePicker`**

Trigger tlačítko v `CardDueDatePicker.tsx` změnit na `variant="ghost" size="sm"` s třídou `h-7 px-2 -ml-2 font-normal` a text bez data „Přidat termín“ v `text-muted-foreground`. Stejně `CardMembersPicker`, `CardLabelsPicker`, `CardPriorityPicker` triggery (`variant="ghost" size="sm" className="h-7 -ml-2 px-2 font-normal"`). Cíl: řádky `dl` vypadají jako text s hover pozadím (Linear property row), ne jako řada tlačítek.

- [ ] **Step 6: Typecheck, testy, commit**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: PASS. Ověřit, že `CardDetailContent.tsx` je pod 120 řádků.

```bash
git add components/projekty/boards
git commit -m "feat(projekty): detail karty — 6 polí hned, zbytek pod „Více“ (D10)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 7: Editor popisu se šesti tlačítky (D11)

**Files:**
- Modify: `components/projekty/editor/TiptapEditor.tsx` (celý)
- Modify: `components/projekty/boards/CardDescriptionEditor.tsx:50`
- Delete: `components/projekty/editor/SlashMenuPopover.tsx`, `components/projekty/editor/blocks.ts`, `components/projekty/editor/block-previews.tsx`, `components/projekty/editor/extensions/SlashCommand.ts` (+ případný `blocks.test.ts`)
- Modify: každý další volající `TiptapEditor` s `variant=` (`grep -rn "variant=\"rich\"\|TiptapEditorVariant" components app`)

**Interfaces:**
- Produces: `TiptapEditor({ value, onChange, placeholder?, className?, cardId? })` bez `variant`. Callout/Toggle zůstávají registrované jen pro zobrazení starého obsahu.

- [ ] **Step 1: Zjistit volající**

Run: `grep -rn "TiptapEditor\b" components app --include=*.tsx | grep -v "editor/TiptapEditor.tsx"`
Expected: `CardDescriptionEditor.tsx` a případně `components/projekty/todos/PersonalTodoDetailSheet.tsx`. Poznamenat si je.

- [ ] **Step 2: Přepsat `TiptapEditor.tsx`**

```tsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Bold, Italic, ImagePlus, List, ListChecks } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/projekty/ui/button";
import { LinkPopover } from "./LinkPopover";
import { Callout } from "./extensions/Callout";
import { Toggle, ToggleSummary, ToggleBody } from "./extensions/Toggle";
import { ImageUpload, uploadAndInsert } from "./extensions/ImageUpload";

/**
 * Editor popisu se šesti tlačítky (D11): tučně, kurzíva, odrážky, checklist, odkaz, obrázek.
 * Callout a Toggle zůstávají registrované, aby se starý obsah vykreslil; nová tlačítka pro ně nejsou.
 */
export function TiptapEditor({
  value,
  onChange,
  placeholder = "",
  className = "",
  cardId,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  /** Bez cardId (osobní úkol) není kam nahrát obrázek → tlačítko se skryje. */
  cardId?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false, blockquote: false, codeBlock: false, horizontalRule: false }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
      TaskList,
      TaskItem.configure({ nested: false }),
      Callout,
      Toggle,
      ToggleSummary,
      ToggleBody,
      ...(cardId ? [Image, ImageUpload.configure({ cardId })] : []),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    immediatelyRender: false,
  });

  async function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editor || !cardId) return;
    await uploadAndInsert(editor.view, file, cardId);
    e.target.value = "";
  }

  if (!editor) return null;

  const tool = (active: boolean) => ({
    type: "button" as const,
    size: "icon-sm" as const,
    variant: "ghost" as const,
    className: active ? "size-7 bg-muted text-foreground" : "size-7 text-muted-foreground",
  });

  return (
    <div className={`rounded-lg border border-border bg-card ${className}`}>
      <div className="flex items-center gap-0.5 border-b border-border px-1.5 py-1">
        <Button {...tool(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()} aria-label="Tučně" title="Tučně (Ctrl B)">
          <Bold className="size-3.5" />
        </Button>
        <Button {...tool(editor.isActive("italic"))} onClick={() => editor.chain().focus().toggleItalic().run()} aria-label="Kurzíva" title="Kurzíva (Ctrl I)">
          <Italic className="size-3.5" />
        </Button>
        <Button {...tool(editor.isActive("bulletList"))} onClick={() => editor.chain().focus().toggleBulletList().run()} aria-label="Odrážky">
          <List className="size-3.5" />
        </Button>
        <Button {...tool(editor.isActive("taskList"))} onClick={() => editor.chain().focus().toggleTaskList().run()} aria-label="Checklist">
          <ListChecks className="size-3.5" />
        </Button>
        <LinkPopover editor={editor} />
        {cardId ? (
          <Button {...tool(false)} onClick={() => fileInputRef.current?.click()} aria-label="Vložit obrázek">
            <ImagePlus className="size-3.5" />
          </Button>
        ) : null}
      </div>
      {cardId ? (
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleFilePick} />
      ) : null}
      <EditorContent
        editor={editor}
        className="min-h-20 p-3 text-sm focus:outline-none [&_*:focus]:outline-none [&_p]:my-1 [&_ul]:ml-4 [&_ul]:list-disc [&_ol]:ml-4 [&_ol]:list-decimal [&_ul[data-type=taskList]]:ml-0 [&_ul[data-type=taskList]]:list-none [&_a]:text-projekty-accent [&_a]:underline [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_img]:max-w-full [&_img]:rounded [&_h1]:text-base [&_h1]:font-semibold [&_h2]:text-base [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_pre]:rounded [&_pre]:bg-muted [&_pre]:p-2 [&_pre]:text-xs"
      />
    </div>
  );
}
```

`LinkPopover` musí vykreslovat tlačítko stejné velikosti (`size-7`); pokud má vlastní `Button` s `size="icon"`, upravit na `size="icon-sm" className="size-7 text-muted-foreground"`.

Pozn.: `heading: false` v StarterKit znamená, že starý `<h1>` obsah se při načtení převede na odstavec — spec §14 to připouští („při editaci se převedou na odstavce“). Pokud má být zachován i při editaci, místo `heading: false` nechat heading zapnutý a jen nemít tlačítko; rozhodnutí implementátora: **nechat heading zapnutý bez tlačítka** (menší ztráta dat), `codeBlock`, `blockquote`, `horizontalRule` také ponechat zapnuté. Tj. `StarterKit` bez configure. Vzhledové třídy pro h1–h3 výše na to počítají.

- [ ] **Step 3: Odstranit `variant` u volajících**

`CardDescriptionEditor.tsx:50`: `<TiptapEditor value={draft} onChange={setDraft} placeholder="Popis karty…" cardId={cardId} />`. Ostatní volající z kroku 1: smazat `variant="rich"`. Náhled bez editace (`CardDescriptionEditor` ř. 27–46) sladit: `className="block w-full rounded-lg border border-transparent p-2 -m-2 text-left text-sm hover:border-border"`, placeholder „Přidat popis…“.

- [ ] **Step 4: Smazat slash menu**

```bash
git rm components/projekty/editor/SlashMenuPopover.tsx components/projekty/editor/blocks.ts components/projekty/editor/block-previews.tsx components/projekty/editor/extensions/SlashCommand.ts
```

Run: `ls components/projekty/editor components/projekty/editor/extensions; grep -rn "SlashCommand\|filterBlocks\|blocks\"" components lib --include=*.ts --include=*.tsx`
Expected: žádný odkaz. Pokud existuje `blocks.test.ts` nebo `SlashCommand.test.ts`, `git rm` také. `EmojiPicker.tsx` zůstává (používá ho `CalloutNodeView`).

- [ ] **Step 5: Typecheck, testy, commit**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: PASS.

```bash
git add components/projekty/editor components/projekty/boards/CardDescriptionEditor.tsx components/projekty/todos
git commit -m "feat(projekty): editor popisu se šesti tlačítky, slash menu pryč (D11)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 8: Jeden checklist, akce položky pod ⋯ (D12)

**Files:**
- Create: `lib/projekty/checklist-summary.ts`, `lib/projekty/checklist-summary.test.ts`, `components/projekty/boards/ChecklistItemMenu.tsx`
- Modify: `components/projekty/boards/CardChecklistSection.tsx` (celý), `components/projekty/boards/ChecklistItemRow.tsx:92-214`

**Interfaces:**
- Produces: `summarizeChecklists(lists): { done; total; pct }`, `canAddAnotherChecklist(lists): boolean`; `ChecklistItemMenu({ item, boardMembers, onPatch, onDelete })`.
- Consumes: API `POST /api/projekty/cards/[id]/checklists`, `POST /api/projekty/checklists/[id]/items`, `PATCH|DELETE /api/projekty/checklist-items/[id]` (beze změny).

- [ ] **Step 1: Failing test**

`lib/projekty/checklist-summary.test.ts`:

```ts
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
```

- [ ] **Step 2: Spustit, ověřit selhání**

Run: `npx vitest run lib/projekty/checklist-summary.test.ts`
Expected: FAIL — modul neexistuje.

- [ ] **Step 3: Implementovat**

`lib/projekty/checklist-summary.ts`:

```ts
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
```

Run: `npx vitest run lib/projekty/checklist-summary.test.ts`
Expected: PASS.

- [ ] **Step 4: Vytvořit `ChecklistItemMenu.tsx`**

```tsx
"use client";

import { useState } from "react";
import { Calendar, MoreHorizontal, Trash2, User as UserIcon, X } from "lucide-react";
import { cs } from "date-fns/locale";
import { Button } from "@/components/projekty/ui/button";
import { Calendar as CalendarPicker } from "@/components/projekty/ui/calendar";
import { ConfirmDialog } from "@/components/projekty/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/projekty/ui/dropdown-menu";
import { Popover, PopoverContent } from "@/components/projekty/ui/popover";
import { UserAvatar } from "@/components/projekty/UserAvatar";
import type { ChecklistItem } from "./ChecklistItemRow";

type UserLite = { id: number; email: string | null; name: string | null; image: string | null };

/** ⋯ menu položky checklistu (D12): Přiřadit osobu · Termín · Smazat. Max 5 položek (C8). */
export function ChecklistItemMenu({
  item,
  boardMembers,
  onPatch,
  onDelete,
}: {
  item: ChecklistItem;
  boardMembers: UserLite[];
  onPatch: (payload: Record<string, unknown>) => Promise<unknown>;
  onDelete: () => Promise<void>;
}) {
  const [sub, setSub] = useState<"who" | "when" | null>(null);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon-xs" variant="ghost" aria-label="Akce položky" className="text-muted-foreground">
            <MoreHorizontal className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onSelect={() => setSub("who")}><UserIcon className="size-4" /> Přiřadit osobu</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setSub("when")}><Calendar className="size-4" /> Termín položky</DropdownMenuItem>
          {item.assigneeId || item.dueDate ? (
            <DropdownMenuItem onSelect={() => void onPatch({ assigneeId: null, dueDate: null })}><X className="size-4" /> Odebrat osobu a termín</DropdownMenuItem>
          ) : null}
          <DropdownMenuSeparator />
          <ConfirmDialog
            trigger={<DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-700 focus:text-red-700 dark:text-red-400"><Trash2 className="size-4" /> Smazat</DropdownMenuItem>}
            title={`Smazat „${item.text}“?`}
            destructive
            confirmLabel="Smazat"
            onConfirm={onDelete}
          />
        </DropdownMenuContent>
      </DropdownMenu>

      <Popover open={sub === "who"} onOpenChange={(o) => !o && setSub(null)}>
        <PopoverContent className="w-56 p-1" align="end">
          {boardMembers.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => {
                void onPatch({ assigneeId: u.id });
                setSub(null);
              }}
              className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[13px] hover:bg-muted"
            >
              <UserAvatar user={u} className="size-5" />
              <span className="truncate">{u.name ?? u.email ?? "—"}</span>
            </button>
          ))}
        </PopoverContent>
      </Popover>

      <Popover open={sub === "when"} onOpenChange={(o) => !o && setSub(null)}>
        <PopoverContent className="w-auto p-0" align="end">
          <CalendarPicker
            mode="single"
            selected={item.dueDate ? new Date(item.dueDate) : undefined}
            onSelect={(date) => {
              void onPatch({ dueDate: date ? date.toISOString() : null });
              setSub(null);
            }}
            locale={cs}
          />
        </PopoverContent>
      </Popover>
    </>
  );
}
```

Pozn.: `Popover` bez `PopoverTrigger` se ukotví k nejbližšímu předkovi; pokud se otevře na špatném místě, obalit obě `Popover` do `<PopoverAnchor asChild>` kolem tlačítka ⋯ (Radix `PopoverAnchor` je exportovaný v `components/projekty/ui/popover.tsx`).

- [ ] **Step 5: Zjednodušit `ChecklistItemRow`**

Nahradit `return (…)` (ř. 92–214):

```tsx
  return (
    <div className="group flex min-h-8 items-center gap-2 rounded-md px-1 hover:bg-muted/40">
      <Checkbox checked={item.done} disabled={busy} onCheckedChange={(v) => void handleToggle(Boolean(v))} className="size-4 rounded" />
      {editing ? (
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => void handleTextSave()}
          onKeyDown={(e) => {
            if (e.key === "Enter") void handleTextSave();
            if (e.key === "Escape") {
              setText(item.text);
              setEditing(false);
            }
          }}
          autoFocus
          className="h-7 text-[13px]"
          disabled={busy}
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className={`flex-1 truncate text-left text-[13px] ${item.done ? "text-muted-foreground line-through" : ""}`}
        >
          {item.text}
        </button>
      )}
      {assignee ? (
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground" title={assignee.name ?? undefined}>
          <UserAvatar user={assignee} className="size-4" />
        </span>
      ) : null}
      {due ? <DueDateBadge due={due} completed={item.done} className="text-xs" /> : null}
      <span className="opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-within:opacity-100 motion-reduce:transition-none [@media(pointer:coarse)]:opacity-100">
        <ChecklistItemMenu item={item} boardMembers={boardMembers} onPatch={patch} onDelete={handleDelete} />
      </span>
    </div>
  );
```

Odstranit nepoužité importy (`Popover*`, `CalendarPicker`, `ConfirmDialog`, `Trash2`, `UserIcon`, `Calendar`, `X`, `Check`, `cs`, `Button`).

- [ ] **Step 6: Přepsat `CardChecklistSection`**

Hlavička sekce s progressem, automatické vytvoření prvního checklistu při přidání první položky, „Přidat další seznam“ jen podle `canAddAnotherChecklist`:

```tsx
  async function ensureChecklist(): Promise<Checklist | null> {
    if (checklists[0]) return checklists[0];
    const res = await fetch(`/api/projekty/cards/${cardId}/checklists`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Checklist" }),
    });
    if (!res.ok) {
      toast.error("Vytvoření checklistu selhalo.");
      return null;
    }
    const { checklist } = (await res.json()) as { checklist: Checklist };
    const created = { ...checklist, items: checklist.items ?? [] };
    setChecklists((prev) => [...prev, created]);
    return created;
  }
```

Render:

```tsx
  const summary = summarizeChecklists(checklists);
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Checklist</h3>
        {summary.total > 0 ? <span className="text-xs tabular-nums text-muted-foreground">{summary.done}/{summary.total}</span> : null}
      </div>
      {summary.total > 0 ? (
        <div className="flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full border border-border bg-muted/40">
            <div className="h-full bg-emerald-600 transition-[width] duration-200 motion-reduce:transition-none dark:bg-emerald-500" style={{ width: `${summary.pct}%` }} />
          </div>
          <span className="text-xs tabular-nums text-muted-foreground">{summary.pct} %</span>
        </div>
      ) : null}

      {checklists.map((cl, idx) => (
        <div key={cl.id} className="space-y-0.5">
          {checklists.length > 1 ? (
            <div className="flex items-center justify-between pt-2">
              <h4 className="text-[13px] font-medium">{cl.name}</h4>
              <ConfirmDialog
                trigger={<Button size="icon-xs" variant="ghost" aria-label="Smazat seznam" className="text-muted-foreground"><Trash2 className="size-3.5" /></Button>}
                title={`Smazat seznam „${cl.name}“?`}
                description="Smaže seznam včetně všech položek."
                destructive
                confirmLabel="Smazat"
                onConfirm={() => handleDeleteChecklist(cl.id)}
              />
            </div>
          ) : null}
          {cl.items.map((item) => (
            <ChecklistItemRow key={item.id} item={item} boardMembers={boardMembers} onUpdate={…stejné jako dnes…} onDelete={…stejné jako dnes…} />
          ))}
          {idx === checklists.length - 1 || checklists.length === 1 ? null : null}
          <ChecklistItemAddInline checklistId={cl.id} onAdd={handleAddItem} />
        </div>
      ))}

      {checklists.length === 0 ? (
        <ChecklistItemAddInline
          checklistId={null}
          onAdd={async (_id, text) => {
            const cl = await ensureChecklist();
            if (cl) await handleAddItem(cl.id, text);
          }}
        />
      ) : null}

      {canAddAnotherChecklist(checklists) ? (
        !addingTitle ? (
          <button type="button" onClick={() => setAddingTitle(true)} className="text-xs text-muted-foreground hover:text-foreground">
            + Přidat další seznam
          </button>
        ) : (
          …stávající inline formulář pro název (ř. 94–124), Input `h-7 text-[13px]`…
        )
      ) : null}
    </div>
  );
```

`ChecklistItemAddInline` upravit: `checklistId: string | null`, tlačítko „Přidat položku“ ve stylu `flex h-8 w-full items-center gap-2 rounded-md px-1 text-[13px] text-muted-foreground hover:bg-muted/40`, po Enteru zůstat otevřený pro další položku (nevolat `setActive(false)`). Řádek `{idx === … ? null : null}` z ukázky výše **nepsat** (je tam jen jako připomínka, že mezi seznamy není další oddělovač). Import `summarizeChecklists`, `canAddAnotherChecklist`.

- [ ] **Step 7: Typecheck, testy, commit**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: PASS. `CardChecklistSection.tsx` ≤ 200 řádků; pokud ne, vynést `ChecklistItemAddInline` do vlastního souboru.

```bash
git add lib/projekty/checklist-summary.ts lib/projekty/checklist-summary.test.ts components/projekty/boards/ChecklistItemMenu.tsx components/projekty/boards/ChecklistItemRow.tsx components/projekty/boards/CardChecklistSection.tsx
git commit -m "feat(projekty): jeden checklist s progressem, akce položky pod ⋯ (D12)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 9: Sjednocení shadcn komponent s parent app (D20) — koordinovat s Michalem

**Files:**
- Modify (nahradit obsahem z modulu): `components/ui/{badge,button,calendar,input,label,popover,select,separator,textarea,tooltip}.tsx`
- Create (přesun z modulu): `components/ui/{alert-dialog,alert,avatar,card,checkbox,command,confirm-dialog,dialog,dropdown-menu,empty-state,form,kbd,radio-group,responsive-dialog,responsive-popover,scroll-area,sheet,skeleton,slider,sonner,tabs}.tsx`
- Modify: všechny importy `@/components/projekty/ui/*` v `components/projekty/**`, `app/(dashboard)/projekty/**`
- Delete: `components/projekty/ui/`

**Interfaces:**
- Produces: jedna sada `@/components/ui/*` s API modulové verze (superset: `size="xs" | "icon-xs" | "icon-sm" | "icon-lg"`, `SelectTrigger size`, `data-slot` atributy).

**Kontext pro implementátora:** Parent verze jsou starší generace shadcn (`@radix-ui/react-slot`, `shadow`, `ring-1`), modulové novější (`radix-ui`, `ring-[3px]`, `active:scale-[0.97]`). Modul používá `size="icon-sm"`, `icon-xs`, `xs` a `SelectTrigger size`, které starší verze nemá. Proto se **parent verze nahrazují novějšími** (API je nadmnožina). Vizuální dopad na zbytek appky: jemnější focus ring, bez stínu na výchozím tlačítku, lehký scale při kliku. **Před tímto taskem napsat Michalovi** (zpráva v kroku 1). Pokud Michal nesouhlasí, task přeskočit — nic dalšího ve vlně 6 na něm nezávisí.

- [ ] **Step 1: Zjistit dopad na ostatní moduly**

Run:
```bash
grep -rl "@/components/ui/" app components --include=*.tsx | grep -v projekty | wc -l
grep -rhn "size=\"\|variant=\"" $(grep -rl "@/components/ui/button" app components --include=*.tsx | grep -v projekty) | grep -o 'size="[a-z-]*"\|variant="[a-z]*"' | sort | uniq -c
```
Expected: seznam použitých `size`/`variant` hodnot mimo modul; všechny (`default`, `sm`, `lg`, `icon`, `ghost`, `outline`, …) existují i v nové verzi. Pokud se objeví hodnota, kterou nová verze nemá, doplnit ji do nové verze před nahrazením. Výsledek poslat Michalovi spolu s větou: „Nahrazuji 10 základních shadcn komponent v `components/ui` novější verzí (stejné API + nové velikosti); vizuálně jemnější focus ring a bez stínu na tlačítku. Ozvi se, pokud to chceš jinak.“

- [ ] **Step 2: Nahradit 10 duplicit a přesunout zbytek**

```bash
cd /Users/vojtatokan/Desktop/IG/appintegraf
for f in badge button calendar input label popover select separator textarea tooltip; do cp components/projekty/ui/$f.tsx components/ui/$f.tsx; done
for f in alert-dialog alert avatar card checkbox command confirm-dialog dialog dropdown-menu empty-state form kbd radio-group responsive-dialog responsive-popover scroll-area sheet skeleton slider sonner tabs; do git mv components/projekty/ui/$f.tsx components/ui/$f.tsx; done
sed -i '' 's#@/lib/projekty/utils#@/lib/utils#g; s#@/components/projekty/ui/#@/components/ui/#g' components/ui/*.tsx
```

Run: `ls components/projekty/ui` → prázdné; `rmdir components/projekty/ui`.

- [ ] **Step 3: Přepsat importy v modulu**

```bash
grep -rl "@/components/projekty/ui/" app components hooks lib --include=*.tsx --include=*.ts | xargs sed -i '' 's#@/components/projekty/ui/#@/components/ui/#g'
grep -rn "@/components/projekty/ui/" app components hooks lib
```
Expected: žádný výskyt. `lib/projekty/utils.ts` (`cn`) ponechat — používají ho ostatní modulové soubory.

- [ ] **Step 4: Ověřit, že `sonner` Toaster je mountnutý jen jednou**

Run: `grep -rn "<Toaster" app components`
Expected: jeden výskyt (v root layoutu nebo v `projekty/layout.tsx`). Pokud jsou dva (parent i modul), ponechat ten v root layoutu a modulový smazat.

- [ ] **Step 5: Typecheck, lint, testy, build, commit**

Run: `npx tsc --noEmit && npm run lint && npm test && npm run build`
Expected: PASS. Při typových chybách v ostatních modulech (např. `Badge` prop `variant` hodnota, která v nové verzi chybí) doplnit variantu do `components/ui/badge.tsx`, ne měnit volající.

```bash
git add components/ui components/projekty app "app/(dashboard)"
git commit -m "refactor(ui): jedna sada shadcn komponent pro appku i modul Projekty (D20)

Parent verze nahrazeny novější generací z modulu (superset API), 21 komponent
přesunuto do components/ui, components/projekty/ui zrušeno.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

- [ ] **Step 6: Aktualizovat modulová pravidla**

V `components/projekty/CLAUDE.md` sekci „UI komponenty“ přepsat: „Vždy použij `@/components/ui/*` (sdílená sada appky). Modul nemá vlastní kopie. Chybí-li komponenta, přidej ji do `components/ui/` standardním shadcn souborem a dej vědět Michalovi.“ Sekci „Design tokeny a vizuální jazyk“ nahradit odkazem na spec §5 a pravidla C1–C14 (viz Task 10).

---

### Task 10: Vizuální review, pravidla, dokumentace, uzavření vlny

**Files:**
- Modify: `components/projekty/CLAUDE.md`, `docs/MODUL_PROJEKTY_REDESIGN_RESEARCH.md` (sekce 6 „Navržené pořadí buildu“), `docs/MODUL_PROJEKTY_ZJEDNODUSENI_SPEC.md` (stav)

- [ ] **Step 1: Spustit appku a projít obrazovky proti C-pravidlům**

Vojta spustí dev server (`npm run dev -- -p 3100`, port 3000 bývá obsazený). Přihlásit se testovacím účtem z `e2e/` (viz `playwright.config.ts`). Pro každou obrazovku pořídit screenshot 1440 px a 390 px (Playwright skript ve scratchpadu, ne v repu) a ručně spočítat:

| Obrazovka | Kontrola | Limit |
|---|---|---|
| Board (kanban) | interaktivní prvky v toolbaru | ≤ 8 (zpět, název, 3 pohledy, Filtr, Nová karta, ⋯) |
| Karta | metadata mimo název | ≤ 3 + vlaječka |
| Detail (panel) | pole bez rozbalení „Více“ | ≤ 6 + komentáře |
| Editor | tlačítka | 6 (5 bez cardId) |
| Checklist položka | viditelné akce v klidu | 0 (⋯ na hover) |
| Sloupec | barevná plocha | jen tečka 8 px |
| Celé UI | brand červená mimo shell | 0 výskytů (`grep -rn "bg-primary\|text-primary\|ring-primary\|border-primary" components/projekty` = 0) |

Každé porušení opravit v příslušném souboru a commitnout jako `fix(projekty): …`.

- [ ] **Step 2: Dark mode a touch**

Přepnout ThemeToggle, projít tytéž obrazovky. Na 390 px ověřit: toolbar nepřetéká (labely pohledů skryté, `Nová karta` jen ikona), chipy filtrů se zalamují, ⋯ položky checklistu viditelné bez hoveru.

- [ ] **Step 3: Aktualizovat `components/projekty/CLAUDE.md`**

Sekci „Vizuální jazyk („Linear škola")“ nahradit:

```markdown
## Vizuální jazyk (spec MODUL_PROJEKTY_ZJEDNODUSENI_SPEC.md §5, pravidla C1–C14)

- Akcent modulu: `projekty-accent` (modrá). `--primary` (brand červená) se v modulu nepoužívá.
- Sytá barva jen pro stav: po termínu (red), dnes (amber), hotovo (emerald), urgentní priorita (red/orange). Sloupec a štítek = malý tvar (tečka 8 px, proužek 3 px), nikdy plocha.
- Border-first: `rounded-lg border border-border bg-card`; stín jen `hover:shadow-sm` a při dragu.
- Písmo: 4 velikosti — `text-[22px]` titulek stránky, `text-sm` text, `text-[13px]` UI/seznamy, `text-xs` metadata. Hierarchie vahou (`font-medium`/`font-semibold`).
- Karta: název + max 3 metadata (termín, checklist, avatar) — rozhoduje `lib/projekty/card-meta.ts`.
- Detail: 6 polí hned, zbytek pod „Více“. Nový údaj na kartě/v detailu = nejdřív ukázat, že neporuší C2/C3.
- Jedno primární (plné) tlačítko na obrazovce. Menu max 5 položek. Modal jen pro destruktivní potvrzení.
- Motion: `transition-colors duration-150 motion-reduce:transition-none`; sekundární akce `opacity-0 group-hover:opacity-100`, na `pointer: coarse` vždy viditelné.
```

- [ ] **Step 4: Zapsat stav do research docu a specu**

Do `docs/MODUL_PROJEKTY_REDESIGN_RESEARCH.md` sekce 6 přidat bod „**Vlna 6 — Ubrat**: ✅ HOTOVO (datum, N commitů) — viz `MODUL_PROJEKTY_ZJEDNODUSENI_SPEC.md`“ a pod „Vlna 5B“ poznámku, že pořadí přebírá spec zjednodušení (vlny 7, 8). Ve specu změnit `Stav: **návrh k review**` na `Stav: vlna 6 hotová (datum), vlna 7 v plánu`.

- [ ] **Step 5: Multi-agent code review**

Spustit stávající praxi: `git diff main...feat/modul-projekty --stat` jako vstup, paralelní review agenti (správnost, a11y, výkon, konzistence s pravidly C1–C14). Potvrzené nálezy opravit a commitnout jako `fix(projekty): opravy z review vlny 6`.

- [ ] **Step 6: Závěrečná kontrola a commit dokumentace**

Run: `npx tsc --noEmit && npm run lint && npm test && npm run build`
Expected: PASS.

```bash
git add components/projekty/CLAUDE.md docs/MODUL_PROJEKTY_REDESIGN_RESEARCH.md docs/MODUL_PROJEKTY_ZJEDNODUSENI_SPEC.md
git commit -m "docs(projekty): vlna 6 hotová — pravidla C1–C14 v modulovém CLAUDE.md, stav v research docu

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

Nasazení řeší Michal (`git pull`, `npm ci`, `npx prisma generate`, `npm run db:projekty-migrate`, `npm run build`, `pm2 reload`). Migrace vlny 6 maže sloupec `cover` — před nasazením záloha DB.

---

## Self-review (provedeno při psaní)

**Pokrytí specu (vlna 6):** D4 → Task 5 · D5 → Task 4 · D6 → Task 5 (kalendář zůstává, toolbar přepínač) · D7 → Task 3 · D8 → Task 3 (vlaječka) + Task 6 (priorita pod Více) · D10 → Task 6 · D11 → Task 7 · D12 → Task 8 · D18 → Tasky 3–8 (třídy) + Task 10 (kontrola) · D19 → Task 1 + Task 3/5/6 (použití) · D20 → Task 9 · D21 → Task 2. §6.7 kalendář hlavička „‹ Měsíc ›  Dnes“: stávající `CalendarHeader` (64 řádků) už tohle dělá; pokud má navíc jiné prvky, zredukovat v Task 5 kroku 8 (doplnit dle skutečnosti). §6.8 „Opakování“ a „Sloupec/Projekt“ v „Více“ jsou vlna 8/7 → záměrně chybí. §6.10 Ctrl K a §7 quick add → vlna 7.

**Placeholders:** ukázka v Task 8 kroku 6 obsahuje `…stejné jako dnes…` pro `onUpdate`/`onDelete` — jsou to beze změny převzaté callbacky z původního souboru (ř. 162–184), implementátor je zkopíruje; totéž „stávající inline formulář“ (ř. 94–124). Ostatní kroky mají úplný kód.

**Konzistence typů:** `BoardStats` definován v `BoardToolbar.tsx` a importován v `BoardView.tsx`; `cardMeta` bere `CardData` (obsahuje všechna pole `CardMetaInput`, `completed` včetně); `ChecklistItem` exportován z `ChecklistItemRow.tsx` a použit v `ChecklistItemMenu.tsx`; `FullCard` exportován z `CardDetailContent.tsx` a importován hlavičkou i „Více“ (kruhový import typu je v TS bezpečný, `import type`).
