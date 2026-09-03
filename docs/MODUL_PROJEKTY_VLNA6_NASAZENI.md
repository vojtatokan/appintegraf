# Modul Projekty — vlna 6 „Ubrat“: nasazení a předání

Datum: 3. 9. 2026 · Větev: `feat/projekty-vlna6` (21 commitů nad `feat/modul-projekty`) · Spec: `MODUL_PROJEKTY_ZJEDNODUSENI_SPEC.md` · Plán: `MODUL_PROJEKTY_VLNA6_PLAN.md`

Stav: kód hotový, typecheck / testy / build čisté, 10 tasků s per-task review + závěrečná review celé větve (opravy zapracované). **Neproběhlo:** vizuální kontrola v prohlížeči (na vývojovém stroji chyběla lokální DB) a živá migrace.

## 1. Pořadí nasazení (Michal)

1. `git pull` větve (po mergi do `feat/modul-projekty` / hlavní větve)
2. `npm ci` (postinstall = `prisma generate`)
3. `npm run build`
4. **Záloha DB** (migrace maže sloupec `projekty_card.cover`)
5. `npm run db:projekty-migrate` — spustit **dvakrát**: druhý běh musí hlásit přeskočení u `DROP`/`ADD` a 0 změněných řádků u `UPDATE`
6. Kontrola: `SELECT cardId, SUM(role='OWNER') o FROM projekty_card_member GROUP BY cardId HAVING o <> 1;` → 0 řádků
7. `pm2 reload` — migraci a reload držet těsně u sebe (starý proces po `DROP cover` selže na čtení karet, nový proces bez `role` selže na čtení členů)

Migrace `prisma/migrations/20260903_projekty_simplify.sql`: drop `cover`, add `projekty_card_member.role ENUM('OWNER','FOLLOWER') DEFAULT 'FOLLOWER'`, backfill OWNER jen pro karty bez OWNER (chrání ruční změny z vlny 7), tie-break nejnižší `userId`.

## 2. Zpráva pro Michala — sdílené komponenty `components/ui`

Modul Projekty už nemá vlastní kopie shadcn komponent (`components/projekty/ui/` zaniklo). Do sdílené sady `components/ui/` přibylo 21 souborů (dialog, sheet, tabs, avatar, card, checkbox, command, dropdown-menu, empty-state, kbd, skeleton, sonner, …) a 10 existujících (`badge, button, calendar, input, label, popover, select, separator, textarea, tooltip`) je nahrazeno novější generací shadcn (`radix-ui` balíček, `data-slot`, nové velikosti `xs`, `icon-xs`, `icon-sm`, `icon-lg`).

**Pro ostatní moduly (Smlouvy, Plánování, Sidebar…) se vzhled ani chování nemění** — výchozí hodnoty parent verze jsou zachované: `Select position="popper"`, `Popover align="center"`, `Tooltip` bez override zpoždění + `sideOffset=4` + brand barvy bez šipky, `Calendar` = původní soubor 1:1, `Button sm` s `text-xs`, stíny na tlačítkách, bez `active:scale`, `Badge rounded-md font-semibold`, `Textarea` bez `field-sizing-content`. Jediné zamýšlené rozdíly: focus ring 1 → 3 px u button/input, `Label` je `flex items-center gap-2`, nové velikosti/varianty jsou navíc k dispozici. Všechny `size`/`variant` hodnoty použité mimo modul (19× `sm`, 15× `ghost`, 8× `outline`, …) v nové verzi existují; `tsc` a `npm run build` procházejí.

Dvě věci mimo tuto vlnu, které stojí za tvé rozhodnutí:
- `app/globals.css` obsahuje `.text-red-600 { color: var(--primary) !important }` — globální past, přebarvuje každou Tailwind červenou na brand červenou.
- `tippy.js` a `@tiptap/suggestion` v `package.json` jsou po smazání slash menu pravděpodobně nepoužité.

Nezávisle na vlně 6 (z research auditu): přílohy modulu se ukládají jako LongBlob v MySQL (velikost záloh) a produkční proces by měl běžet s `TZ=Europe/Prague` (urgence termínů se počítá na serveru).

## 3. Ruční kontrola po nasazení (Vojta)

Pravidla C1–C14 jsou ve specu §4; tady jen to, co se nedalo ověřit bez prohlížeče:

- [ ] Board: jeden řádek ovládání (zpět · název · stav · Nástěnka/Seznam/Kalendář · Filtr · Nová karta · ⋯); pod ním chipy jen s aktivním filtrem
- [ ] „Nová karta“ ze Seznamu/Kalendáře přepne na nástěnku a otevře řádek v prvním sloupci; poté „+ Nová karta“ v jiném sloupci funguje
- [ ] Karta: název + max 3 údaje (termín, checklist, avatar), štítek jako proužek, vlaječka jen u Urgentní/Vysoká
- [ ] Sloupce bez barevného pozadí; při přetahování karty se cílový sloupec podbarví akcentem
- [ ] Detail: 6 polí + komentáře hned, „Více“ (štítky, priorita, přílohy, historie) si pamatuje stav; šířka panelu 460 px
- [ ] Editor popisu: 6 tlačítek (5 u osobního úkolu); stará karta s nadpisy/calloutem/togglem/vnořeným checklistem se otevře, upraví a uloží bez ztráty obsahu
- [ ] Checklist: první položka založí seznam automaticky, řádek zůstává otevřený; ⋯ položky → Přiřadit osobu / Termín se otevřou u tlačítka (ne v rohu); Smazat → potvrzení
- [ ] Dark mode: text na modrém tlačítku čitelný, fajfka na zelené čitelná, chipy filtrů, drop zóna
- [ ] iPhone (390 px): toolbar nepřetéká, tlačítka editoru 36 px, ⋯ položek checklistu viditelné bez hoveru
- [ ] Ostatní moduly: Sidebar tooltipy, tlačítka a badge ve Smlouvách/Plánování vypadají jako před nasazením

## 4. Do vlny 7 (mezery plánu vůči specu §6.8, vědomě nedodané ve vlně 6)

- Předvolby termínu v popoveru (Dnes / Zítra / Příští týden / Bez termínu) — dnes jen kalendář
- Non-modální Sheet (klik na jinou kartu panel přepne) — dnes modální
- „Převést na úkol“ u položky checklistu (potřebuje API)
- Patička „Vytvořil X · datum“ (potřebuje `createdAt`/autora v `FullCard`)
- Drobek v detailu „Projekt › Sloupec“ (dnes jen sloupec)
- Chip filtru × ruší všechny hodnoty daného filtru najednou (per-id clear)
- `BoardView.tsx` (227), `BoardListColumn.tsx` (233), `CardChecklistSection.tsx` (229) nad limitem 200 řádků — kandidát `useChecklists` hook při zavádění `ownerId`

## 5. Rozhodnutí přijatá během implementace (mimo plán)

- Migrace: backfill OWNER jen pro karty bez OWNER (plán měl nepodmíněný UPDATE, který by při každém deployi přepsal ruční změny).
- Editor: `StarterKit` bez `configure` — nadpisy, citace, code block zůstávají registrované bez tlačítek (starý obsah se neztrácí).
- `CardDetailMore`: stav „Více“ přes `useSyncExternalStore` (místo setState v effectu).
- Sdílené komponenty: parent defaulty zachovány (viz §2); modul přijal 12px text u `size="sm"`.
- Nový token `--projekty-accent-foreground` (bílá / tmavá) pro text na akcentu (kontrast 5,0:1 light, 7,7:1 dark).
- Lint gate = žádné nové chyby v dotčených souborech (celý `npm run lint` má 77 předexistujících chyb mimo modul).
