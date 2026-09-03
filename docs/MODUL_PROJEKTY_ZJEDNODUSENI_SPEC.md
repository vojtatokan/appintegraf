# Modul Projekty — spec zjednodušení (vlny 6–8)

Datum: 3. 9. 2026 · Autor: Claude Code (Fable 5.1) pro Vojtu Ťokana · Stav: vlna 6 hotová v kódu (3. 9. 2026, větev feat/projekty-vlna6, čeká na vizuální review a nasazení), vlna 7 v plánu

Podklady: noční research 2.–3. 9. 2026 (10 PM nástrojů + audit modulu), klikací prototyp <https://claude.ai/code/artifact/e31c0ae2-bba8-41af-bd90-9e5207a2b016>, report s rozhodnutími <https://claude.ai/code/artifact/fc962580-2b8f-466c-9715-81c4d791569d>. Kopie reportů: `integraf-todo-trello/docs/research/2026-09-03-projekty-simplification/`.

Navazuje na `docs/MODUL_PROJEKTY_REDESIGN_RESEARCH.md` (vlny 3–5A hotové). **Reviduje** směr „Linear škola“ (jen zčásti), roadmapu vln 5B/6 a rozhodnutí o barevných sloupcích a rich editoru.

---

## 1. Cíl a princip

Modul funkčně nic zásadního nepostrádá; po vlnách 3–5A má víc ovládacích prvků, než kolik unese jednoduchý nástroj pro ne-technický management. Cíl vln 6–8 je **ubrat a sloučit**, ne přidávat. Tři pravidla:

1. **Vzhled a počet prvků se mění, topologie ne.** Umístění primárních akcí (nový úkol, přetažení, checkbox, panel vpravo) zůstává. Trello 2025 a ClickUp 4.0 ukázaly, že přesun prvků z motorické paměti vyvolá odpor.
2. **Progressive disclosure.** Vrstva 1 = co potřebuje 90 % lidí denně. Vrstva 2 = pod „Více“ / „⋯“. Vrstva 3 = nastavení projektu.
3. **Bez volby struktury.** Pevně Projekt › Sloupec › Úkol › Checklist. Žádná uživatelská pole, žádné vnořené subtasky, žádný rule-builder.

## 2. Schválená rozhodnutí (Vojta, 3. 9. 2026)

| # | Rozhodnutí | Verdikt | Vlna |
|---|---|---|---|
| D1 | Domov modulu = Moje práce | ANO | 7 |
| D2 | Texty: Board → Projekt, Karta → Úkol, List → Sloupec | ANO | 7 |
| D3 | Modul Úkoly (/ukoly) má odlišný účel | nechat obojí, mimo scope | – |
| D4 | Jeden řádek ovládání nad projektem | ANO | 6 |
| D5 | Sloupce bez barevného pozadí, barva jen tečka | ANO (reviduje ADR 0024 ze standalone repa) | 6 |
| D6 | Kalendář zůstává jako 3. pohled | ANO | 6 |
| D7 | Karta = název + max 3 údaje, štítek jako proužek | ANO | 6 |
| D8 | Priorita: na kartě jen Urgentní/Vysoká vlaječka, výběr pod „Více“ | ANO, data beze změny | 6 |
| D9 | Odpovídá (1 osoba) + sledující | ANO | 7 |
| D10 | Detail: vrstva 1 = 6 polí, zbytek pod „Více“ | ANO | 6 |
| D11 | Editor popisu = 6 tlačítek | ANO (reviduje ADR 0026 ze standalone repa) | 6 |
| D12 | Jeden checklist, osoba/termín položky pod ⋯ | ANO, data beze změny | 6 |
| D13 | Quick add s datem a jménem v textu | ANO | 7 |
| D14 | Zrušit Ctrl+Shift+U, sloučit do Ctrl K | ANO | 7 |
| D15 | Ponechat: @mentions, šablony (max 5), opakování, přesun mezi projekty, UI archivu | ANO | 8 |
| D16 | Škrtnout: watchers entita, uložené pohledy, rule-builder, odhad pracnosti, subtasky/závislosti/timeline, inbox se snooze | ANO | – |
| D17 | Přehled projektu = řádek v hlavičce + progress na dlaždici | ANO | 7 |
| D18 | Vizuální jazyk: neutrální, border-first, 4 velikosti písma, 1 akcent | ANO | 6 |
| D19 | Akcent modulu modrá, brand červená jen v shellu | ANO | 6 |
| D20 | Sjednotit shadcn komponenty s parent app | ANO | 6 |
| D21 | `Card.cover` smazat, `Card.startDate` nechat bez UI | ANO | 6 |

## 3. Rozsah vln

### Vlna 6 „Ubrat“ — bez změny chování dat, jedna malá migrace
D4, D5, D6, D7, D8, D10, D11, D12, D18, D19, D20, D21. Výsledek: stejné funkce, o třetinu méně prvků na každé obrazovce, jeden vizuální jazyk sdílený s appintegraf.

### Vlna 7 „Domov a zadání“ — mění vstupní body
D1, D2, D9, D13, D14, D17. Výsledek: modul se otevírá na Moje práce, úkol vzniká jedním řádkem odkudkoli, jasná odpovědnost.

### Vlna 8 „Ponechaný backlog“
D15 + dva pevné automatizační recepty (auto-archiv hotových po 30 dnech, notifikace den před termínem). Každá položka dostane vlastní krátký spec před implementací.

### Mimo scope (zapsáno jako rozhodnutí, ne dluh)
Watchers jako entita, uložené pohledy, generický rule-builder, odhad pracnosti, subtasky, závislosti, timeline/Gantt, notifikační inbox se snooze, vlastní pole, WIP limity, AI funkce, modul Úkoly.

## 4. Měřitelná pravidla (kontrolují se při review každé obrazovky)

| # | Pravidlo | Limit |
|---|---|---|
| C1 | Položek v navigaci modulu | max 5 (dnes 2: Moje práce, Projekty) |
| C2 | Polí v detailu bez rozbalení | max 6 (+ komentáře) |
| C3 | Metadat na kartě kromě názvu | max 3 |
| C4 | Interakcí na nový úkol | 1 klik + text + Enter |
| C5 | Plných (primárních) tlačítek na obrazovce | 1 |
| C6 | Velikostí písma v modulu | 4: `text-[22px]` titulek stránky, `text-sm` text, `text-[13px]` UI/seznamy, `text-xs` metadata |
| C7 | Barev mimo neutrální škálu v klidu | 1 akcent + 3 sémantické (po termínu, dnes, hotovo) |
| C8 | Položek v kontextovém menu | max 5 |
| C9 | Modálních dialogů v běžném flow | 0 (jen destruktivní potvrzení a Nový projekt) |
| C10 | Hloubka hierarchie | Projekt › Sloupec › Úkol › Checklist |
| C11 | Stav úkolu | sloupec + `completed` |
| C12 | Kroky onboardingu | 0 |
| C13 | Délka animace | ≤ 200 ms |
| C14 | Výška řádku | 36–40 px desktop, 44 px touch |

## 5. Vizuální jazyk (D18, D19)

- **Tokeny:** výhradně standardní z `app/globals.css`. Plocha `bg-background`, karta `bg-card border-border`, sloupec bez výplně, text `text-foreground` / `text-muted-foreground`.
- **Akcent modulu:** nový token `--projekty-accent` (světlý `oklch(0.55 0.19 262)` ≈ #2f6fed, tmavý `oklch(0.72 0.14 262)`) a `--projekty-accent-soft`. Definovat v `app/globals.css` po dohodě (sdílený soubor, viz §11). Použití: výběr, odkazy, focus ring, primární tlačítko modulu, aktivní položka přepínače. `--primary` (brand červená) se v modulu nepoužívá.
- **Sémantické barvy:** po termínu `text-red-700 bg-red-50` / dark `text-red-400 bg-red-500/15`; dnes amber; hotovo green. Nic jiného nemá sytou barvu v klidu. Barva sloupce a štítku je jen malý tvar (tečka 8 px, proužek 3 px).
- **Border-first:** karty `rounded-lg border`, stín jen `hover:shadow-sm` a při dragu (`shadow-lg`). Popovery a sheet mají stín.
- **Typografie:** Geist zůstává; hierarchie vahou (`font-medium`/`font-semibold`), ne velikostí. Čísla `tabular-nums`.
- **Motion:** `transition-colors duration-150`, `motion-reduce:transition-none`. Sheet 200 ms.
- **Hover-reveal:** sekundární akce `opacity-0 group-hover:opacity-100`, na `pointer: coarse` vždy viditelné (stávající pravidlo z ADR 0029).
- **Dark mode:** vrstvená elevace (ground → surface → elevated → overlay), ne stíny.

## 6. Obrazovky

### 6.1 Navigace modulu (D1, D2)
- Sidebar appintegraf: položka **Projekty** s podnabídkou **Moje práce**, **Projekty**. Kliknutí na hlavní položku i `/projekty` → `redirect('/projekty/moje-prace')`.
- `/projekty/boards` zůstává jako URL (bez přejmenování rout), nadpis stránky **Projekty**. Redirecty `/my-cards`, `/todo` zůstávají.
- Slovník v UI: Projekt, Sloupec, Úkol, Checklist, Odpovídá, Sledují, Termín, Štítek, Moje práce. Anglický nadpis „Boards“ zmizí. Číslo úkolu: `PROJ-42` zůstává.

### 6.2 Moje práce (D1, D13, D17)
Beze změny sekcí z vlny 5A (Po termínu / Dnes / Tento týden / Později / Bez termínu). Změny:
- Nahoře **quick add řádek** (§7). Enter uloží jako osobní úkol (`PersonalTodo`); pokud text obsahuje `#projekt`, vznikne úkol v prvním sloupci daného projektu.
- Sekce **Po termínu** má hover akci **„Přeplánovat vše na dnes“** s undo toastem (Todoist pattern).
- Řádek: kroužek hotovo · 3px proužek štítku (jen první) · název · odznak „Nové“ (≤ 7 dní od `assignedAt`) · název projektu (`text-xs text-muted-foreground`) · checklist `done/total` · termín badge · hvězda (hover) = priorita URGENT/HIGH toggle. Max 3 metadata vpravo (C3).
- Prázdný stav: „Nic k udělání. Přidej úkol nahoře nebo se podívej do projektů.“

### 6.3 Seznam projektů (D17)
- Grid dlaždic (stávající `BoardsGrid`) s novým obsahem: tečka barvy + název · popis (1–2 řádky) · progress bar `done/total` · „N po termínu“ badge jen když N > 0 · avatary členů (max 4).
- Hlavička: eyebrow „N aktivní“, nadpis **Projekty**, vpravo ghost „Archiv“ a jediné primární tlačítko **Nový projekt** (C5). Dialog Nový projekt zůstává (název, popis, barva) — jediný modal mimo potvrzení.

### 6.4 Projekt — horní lišta (D4, D6, D17)
Jeden řádek `h-[52px] border-b bg-card px-5`, zleva:
1. Zpět (ghost ikona) → `/projekty/boards`
2. Tečka barvy + název projektu (`text-[15px] font-semibold`)
3. Stav `text-xs text-muted-foreground`: **X**/Y hotovo · <span red>N po termínu</span> (jen když N > 0)
4. spacer
5. Přepínač pohledů (segmented): Nástěnka / Seznam / Kalendář — `?view=` beze změny
6. **Filtr** (ghost tlačítko; s aktivním filtrem outline + počet). Popover: Kdo (multi), Štítek (multi), Termín (4 předvolby), Skrýt hotové, Seskupit (jen v Seznamu: sloupec / odpovídá / termín / priorita), Zrušit filtry. Hledání v textu se přesouvá do Ctrl K (pole `?q=` zůstává funkční přes URL).
7. **Nový úkol** (jediné primární tlačítko) → otevře quick add v prvním sloupci (Nástěnka) nebo nahoře (Seznam/Kalendář)
8. ⋯ menu (max 5): Nastavení projektu · Archiv úkolů · Uložit jako šablonu (vlna 8, do té doby skryto) · — · Archivovat projekt

Pod lištou **řádek chipů aktivních filtrů** (`fchips`), prázdný = nezobrazuje se. `BoardViewTabs`, `BoardCardFilterBar`, `BoardGroupPicker` se slučují do `BoardToolbar` + `BoardFilterPopover`. `BulkActionBar` zůstává (objeví se jen s výběrem).

### 6.5 Nástěnka (D5, D7, D8)
- **Sloupec:** bez výplně a bez borderu; hlavička = tečka `list.color` 8 px · název `text-[13px] font-medium` · počet `tabular-nums text-muted-foreground` · ⋯ (hover; Přejmenovat, Barva, Přesunout, —, Archivovat). Šířka 272 px, snap scroll zůstává. Drop cíl: sloupec získá `bg-[--projekty-accent-soft]`. `DropLine` zůstává.
- **Karta (`CardItem`)**, shora:
  1. 3px svislý proužek vlevo = barva prvního štítku (tooltip = názvy všech štítků). Bez textových chipů, bez „+N“.
  2. Název `text-[13px]`; hotová karta: zelená fajfka + `line-through text-muted-foreground`.
  3. Meta řádek (`text-xs`, jen pokud má obsah): vlaječka priority **jen pro URGENT (červená) / HIGH (amber)** · termín badge (`DueDateBadge`) · checklist `done/total` (zelené když vše) · avatar odpovídající osoby vpravo (jen jedna, žádné +N).
  4. Nic dalšího: bez coveru (D21), bez počtu komentářů/příloh, bez čísla.
- **Přidat úkol** na konci sloupce = quick add řádek (§7), Enter přidá a nechá řádek otevřený pro další.

### 6.6 Seznam
Beze změny logiky (seskupení, DnD). Řádek = stejný jako v Moje práce (§6.2) bez názvu projektu. Sticky group hlavičky s `backdrop-blur`. Seskupení se volí ve Filtru.

### 6.7 Kalendář (D6)
Beze změny mřížky. Hlavička jen: ‹ · Měsíc rok · › · Dnes. Pill úkolu: název, po termínu červeně. Desktop-only zůstává.

### 6.8 Detail úkolu — Sheet i plná stránka (D8, D10, D11, D12)
Sheet vpravo `sm:max-w-[460px]`, non-modal (klik na jinou kartu panel přepne). Hlavička: číslo úkolu · Kopírovat odkaz · Otevřít na stránce · Zavřít.

**Vrstva 1 (vždy):**
1. Kroužek hotovo (22 px) + název (auto-rostoucí textarea `text-[17px] font-semibold`) + drobek „Projekt › Sloupec“
2. **Termín** — chip s popoverem: Dnes / Zítra / Příští týden / kalendář / Bez termínu; badge „po termínu“
3. **Odpovídá** — chip s jednou osobou (§8); vedle `text-xs` „sledují: jména“
4. **Popis** — editor se 6 tlačítky: tučně, kurzíva, odrážky, checklist, odkaz, obrázek (§6.9)
5. **Checklist** — jedna sekce s progress barem; položka = checkbox + text + (pokud nastaveno) `text-xs` osoba/termín + ⋯ (hover: Přiřadit osobu, Termín položky, Převést na úkol, —, Smazat). Další checklist přes „Přidat další seznam“ na konci (zobrazí se jen když už první existuje a má ≥ 1 položku).
6. **Komentáře** — seznam + textarea s @našeptáváním (vlna 8 dodá backend, UI připravit hned); Ctrl Enter odešle

**„Více“** (disclosure řádek s border-y, zavřený default; stav si pamatuje `localStorage`): Štítky (multi popover) · Priorita (4 stupně + bez priority) · Opakování (vlna 8; do té doby skryto) · Přílohy (upload, seznam) · Sloupec / Projekt (přesun; mezi projekty vlna 8) · Historie (audit feed).

Patička: „Vytvořil X · datum“ · ghost **Archivovat** s undo.

### 6.9 Editor popisu (D11)
`TiptapEditor` dostane variantu `simple` (default pro popis): extensions `StarterKit` (bez heading, blockquote, codeBlock, horizontalRule), `Link`, `TaskList/TaskItem`, `Image` + `ImageUpload`, `Placeholder`. Toolbar 6 tlačítek. **Slash menu, Callout, Toggle, Heading, CodeBlock se z toolbaru odstraní, ale extensions zůstanou registrované v read-only režimu** (existující obsah se vykreslí). Klávesové zkratky Ctrl B / I zůstávají. Komentáře zůstávají plaintext.

### 6.10 Ctrl K (D14)
`CommandPalette` rozšířit: bez dotazu ukazuje akce **Nový úkol** (přejde na Moje práce a fokusuje quick add), Moje práce, Projekty; s dotazem projekty + úkoly (stávající `?q=`); bez výsledku nabídne „Vytvořit úkol ‚text‘“. **Ctrl Enter** v paletě = vytvořit úkol z textu (§7). `QuickCaptureProvider`, `QuickCaptureDialog` a zkratka Ctrl+Shift+U se odstraní. Tooltips primárních tlačítek nesou zkratku (`kbd`).

## 7. Quick add (D13) — sdílená komponenta `TaskQuickAdd`

Jeden řádek pro Moje práce, konec sloupce, Nový úkol a Ctrl K. Parser v `lib/projekty/quick-add-parser.ts` (čistá funkce, Vitest):

| Vzor | Význam | Příklady |
|---|---|---|
| `dnes`, `zítra`, `pozítří` | termín | |
| `po` `út` `st` `čt` `pá` `so` `ne` (+ plná jména, bez diakritiky) | nejbližší takový den v budoucnu | `pá`, `pátek`, `patek` |
| `d.m.` / `d.m.yyyy` | konkrétní datum | `15.9.`, `15. 9. 2026` |
| `za N dní` | relativní | `za 3 dny` |
| `@Jméno` (prefix, bez diakritiky) | odpovídá; nejednoznačné → nabídka | `@Petr` |
| `#projekt` (prefix) | cílový projekt (jen v Moje práce / Ctrl K) | `#abra` |
| `!` na konci nebo samostatně | priorita HIGH | |

- Rozpoznané hodnoty se zobrazí jako **chipy pod řádkem** ještě před uložením; klik na chip = zrušit parsování daného tokenu (token zůstane v názvu). Řeší „pátek“ v názvu úkolu.
- Server: klient pošle už strukturované `{title, dueDate, assigneeId, priority, listId|personal}`; API validuje Zod schématem, parser běží jen na klientu (žádná duplicitní logika na serveru).
- Prázdný název = nic. Shift Enter = nový řádek v názvu (stávající chování). Esc = zavřít.

## 8. Odpovídá + sledují (D9) — datový návrh

Rozhodnutí znělo „bez migrace“. Při návrhu se ukázalo, že „první člen = odpovídá“ nelze spolehlivě odvodit z `assignedAt` (změna odpovědné osoby by vyžadovala přepisovat časy). Protože vlna 6 stejně obsahuje ruční SQL migraci (odstranění `cover`, D21), navrhuji **do téže migrace přidat**:

```sql
ALTER TABLE projekty_card_member ADD COLUMN role ENUM('OWNER','FOLLOWER') NOT NULL DEFAULT 'FOLLOWER';
-- backfill: nejstarší assignedAt na kartě = OWNER
```

- UI: picker **Odpovídá** vybírá jednu osobu (přepnutí = starý OWNER se stane FOLLOWER). Sledující se zobrazují `text-xs` vedle chipu a přidávají se přes „+ sledující“ v tomtéž popoveru; nejsou pod „Více“.
- **Auto-sledování** (nahrazuje watchers): FOLLOWER se automaticky přidá, kdo (a) komentoval, (b) byl zmíněn, (c) byl OWNER a byl vystřídán. Odhlásit se lze v popoveru.
- Notifikace (`lib/projekty/notify.ts`): `projekty_card_assigned` jen pro OWNER; nový typ `projekty_card_activity` pro FOLLOWER při komentáři a změně termínu/sloupce.
- Moje práce ukazuje úkoly, kde jsem OWNER; sekce „Sleduji“ se **nepřidává** (C1, YAGNI).
- Hromadné přiřazení (`BulkMembersPicker`) nastavuje OWNER.

**Potvrzeno Vojtou 3. 9. 2026:** migrace `role` ANO. Jde do téže ruční SQL migrace jako odstranění `cover` (vlna 6), UI „Odpovídá“ přijde ve vlně 7.

## 9. Datové a API změny

| Změna | Vlna | Poznámka |
|---|---|---|
| `ALTER TABLE projekty_card DROP COLUMN cover` | 6 | ruční SQL v `prisma/migrations/`, `npm run db:projekty-migrate`; Prisma schema + typy `CardData` |
| `projekty_card_member.role` | 6 | viz §8, potvrzeno; UI ve vlně 7 |
| `PATCH /api/projekty/cards/[id]` | 7 | přijímá `ownerId` (nahrazuje první člen) |
| `POST /api/projekty/cards` | 7 | přijímá `dueDate`, `ownerId`, `priority` z quick add |
| `POST /api/projekty/personal-todos` | 7 | přijímá `dueDate`, `priority` z quick add |
| Odstranit: Quick Capture route/komponenty | 7 | `components/projekty/todos/QuickCapture*.tsx` |
| Notifikace `projekty_card_activity` | 7 | jen přidání typu |
| `Card.startDate` | – | zůstává v DB bez UI |

Žádné další migrace. Priorita, více checklistů, štítky, přílohy: data beze změny, mění se jen UI.

## 10. Komponenty (D20 + úklid)

- **Sjednocení se shellem:** modul přestane používat vlastní kopie `badge, button, calendar, input, label, popover, select, separator, textarea, tooltip` a importuje je z `@/components/ui`. Komponenty, které parent nemá (`sheet, command, kbd, empty-state, responsive-dialog, responsive-popover, dialog, alert-dialog, dropdown-menu, checkbox, scroll-area, skeleton, tabs, avatar, card, form, radio-group, slider, sonner, alert, confirm-dialog`), se **přesunou do `components/ui/`** jako standardní shadcn soubory, aby je mohly používat i ostatní moduly. `components/projekty/ui/` po vlně 6 zanikne. Vyžaduje dohodu s Michalem (sdílená sada) — Vojta schválil D20, Michal bude informován před mergem.
- **Nové:** `BoardToolbar`, `BoardFilterPopover`, `TaskQuickAdd`, `OwnerPicker`, `MoreDisclosure` (panel), `ProjectProgress`.
- **Slučuje se / maže:** `BoardViewTabs` + `BoardCardFilterBar` + `BoardGroupPicker` → toolbar; `CardQuickAdd` + `PersonalTodoInlineAdd` + `QuickCaptureDialog` → `TaskQuickAdd`; `CardMembersPicker` → `OwnerPicker`; `CardLabelsPicker`, `CardPriorityPicker`, `CardAttachmentsSection`, `CardActivityFeed` se přesouvají pod „Více“.
- **Limit 200 řádků na komponentu** zůstává (pravidlo standalone repa, drží se i tady).

## 11. Sdílené soubory (mimo modul) — vyžadují dohodu

Modulová pravidla (`components/projekty/CLAUDE.md`) zakazují měnit `components/ui/` a `app/globals.css` bez dohody. Tento spec dohodu zakládá pro:
1. `app/globals.css`: přidat `--projekty-accent`, `--projekty-accent-soft` (light + dark).
2. `components/ui/`: přidat chybějící shadcn soubory z modulu (§10), beze změny existujících.
3. `components/layout/Sidebar.tsx`: pořadí podnabídky Projekty (Moje práce první) a cíl hlavní položky.

Nic jiného mimo modul se nemění. Změny jdou v samostatném commitu, aby je Michal viděl odděleně.

## 12. Aktualizace `components/projekty/CLAUDE.md`

Po vlně 6 přepsat sekce: „UI komponenty“ (import z `@/components/ui`), „Vizuální jazyk“ (nahradit „Linear škola“ pravidly C1–C14 a §5), doplnit pravidlo „nová funkce = nejdřív ukázat, že neporuší C2/C3/C5“.

## 13. Testy a kontrola

- **Vitest:** `quick-add-parser` (≥ 25 případů: čeština bez diakritiky, „pátek“ v názvu + zrušení chipu, `15.9.` vs `15. 9. 2026`, `@` nejednoznačné), `my-work` sekce (stávající 13 testů beze změny), `priority` (beze změny), `owner` odvození při backfillu.
- **Playwright smoke** (desktop 1440 + iPhone 390): otevřít Moje práce → quick add „Test pá @Vojta“ → chipy → Enter → řádek v Tento týden; projekt → přetáhnout kartu → undo; detail → Více → štítek.
- **Screenshot review** každé obrazovky proti C1–C14 (počet prvků spočítat ručně v review) a proti prototypu.
- **Multi-agent code review** na konci každé vlny (stávající praxe).

## 14. Rizika a otevřené body

- **Existující popisy s callouty/toggly** zůstanou čitelné (read-only extensions), ale nepůjdou dál upravovat v původním formátu. Přijatelné; při editaci se převedou na odstavce.
- **Uživatelé zvyklí na Ctrl+Shift+U** — jednorázový toast „Použij Ctrl K“ při prvním stisku po nasazení (2 týdny), pak odstranit.
- **Filtr v popoveru** místo vždy viditelné lišty — aktivní filtr musí být jasně vidět (chipy + počet na tlačítku), jinak lidé „ztratí“ karty.
- **Přílohy jako LongBlob v MySQL** a **`TZ=Europe/Prague`** na produkci — pro Michala, nezávisle na tomto specu.
- **Sidebar je per uživatel přeskládatelný** — e2e testy nesmí spoléhat na pořadí položek.

## 15. Odhad

AI-driven, včetně review: vlna 6 ≈ 8–12 dní, vlna 7 ≈ 6–9 dní, vlna 8 ≈ 10–15 dní (per položka vlastní spec). Vlny 6 a 7 lze nasadit odděleně; vlna 6 nemění chování, jen vzhled a počet prvků, takže je vhodná jako první „viditelná“ změna pro management.
