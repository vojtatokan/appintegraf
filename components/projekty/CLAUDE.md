# Modul Projekty — pravidla pro Claude Code

Platí POUZE pro modul Projekty (`app/(dashboard)/projekty/`, `app/api/projekty/`, `components/projekty/`, `lib/projekty/`, `hooks/projekty/`). Nezasahuj kvůli modulu do zbytku appky — zejména ne do `components/ui/` (globální sada) a do sdílených souborů (`app/globals.css`, `auth.ts`, `lib/db.ts`) bez výslovné dohody s Vojtou.

Podklad pro redesign a roadmapu: `docs/MODUL_PROJEKTY_REDESIGN_RESEARCH.md`.

## UI komponenty

Vždy použij `@/components/ui/*` (sdílená sada appky). Modul nemá vlastní kopie. Chybí-li komponenta, přidej ji do `components/ui/` standardním shadcn souborem a dej vědět Michalovi.

- Žádné generické custom prvky, žádné přidávání nových UI knihoven, žádné vendorování duplicit do `components/projekty/`.
- Dialogy a popovery na mobilu: `@/components/ui/responsive-dialog` / `@/components/ui/responsive-popover` (mění se na sheet/drawer).
- Toasty: `sonner` přes `@/components/ui/sonner` (`<Toaster>` mountnutý v `app/(dashboard)/projekty/layout.tsx`; u destruktivních akcí vždy s akcí „Zpět"). Command palette: `cmdk`. Ikony: `lucide-react`. Drag & drop: `@dnd-kit` + sensory z `lib/projekty/dnd-sensors.ts`.

## Design tokeny

- POUZE standardní tokeny z `app/globals.css`: `bg-card`, `bg-background`, `text-muted-foreground`, `border-border`, `--primary`, badge paleta atd.
- **ZÁKAZ**: `--notion-canvas`, `--notion-fg`, `--notion-surface`, `--shadow-card`, `--shadow-card-hover`, `--info` — nikde nejsou definované (historická chyba, probíhá migrace 27 souborů). Nové výskyty nevytvářet, při úpravě souboru staré výskyty migrovat na standardní tokeny.
- Skeleton místo spinnerů pro načítání pohledů; empty states přes `components/ui/empty-state.tsx` (česky, s CTA).

## Vizuální jazyk (spec MODUL_PROJEKTY_ZJEDNODUSENI_SPEC.md §5, pravidla C1–C14)

- Akcent modulu: `projekty-accent` (modrá). `--primary` (brand červená) se v modulu nepoužívá.
- Sytá barva jen pro stav: po termínu (red), dnes (amber), hotovo (emerald), urgentní priorita (red/orange). Sloupec a štítek = malý tvar (tečka 8 px, proužek 3 px), nikdy plocha.
- Border-first: `rounded-lg border border-border bg-card`; stín jen `hover:shadow-sm` a při dragu.
- Písmo: 4 velikosti — `text-[22px]` titulek stránky, `text-sm` text, `text-[13px]` UI/seznamy, `text-xs` metadata. Hierarchie vahou (`font-medium`/`font-semibold`).
- Karta: název + max 3 metadata (termín, checklist, avatar) — rozhoduje `lib/projekty/card-meta.ts`.
- Detail: 6 polí hned, zbytek pod „Více". Nový údaj na kartě/v detailu = nejdřív ukázat, že neporuší C2/C3.
- Jedno primární (plné) tlačítko na obrazovce. Menu max 5 položek. Modal jen pro destruktivní potvrzení.
- Motion: `transition-colors duration-150 motion-reduce:transition-none`; sekundární akce `opacity-0 group-hover:opacity-100`, na `pointer: coarse` vždy viditelné.

## Data a API vzory

- Prisma modely s prefixem `projekty_`; uživatelé = sdílený model `users` (Int id) přes pojmenované relace. Prisma klient výhradně přes `lib/projekty/prisma.ts` (audit extension `withAudit`).
- **Migrace NE přes `prisma migrate`** — ruční SQL soubor v `prisma/migrations/` + spuštění `npm run db:projekty-migrate` (`scripts/run-projekty-migration.mjs`).
- Čtení: RSC (async server components, přímé Prisma dotazy). Mutace: REST routes v `app/api/projekty/**` + `fetch()` z klienta + `router.refresh()`; žádné Server Actions (drž konzistenci).
- Každá route: Zod schéma v `lib/projekty/validators/`, wrapper `withApiError` (`lib/projekty/api-utils.ts`), oprávnění přes `lib/projekty/rbac.ts` / `board-rbac.ts` (preferuj `canViewCard`/`canEditCard` před `canAccessParent`), session přes `lib/projekty/session.ts`.
- Notifikace: `lib/projekty/notify.ts` (sdílená tabulka `notifications` — jen přidávat typy `projekty_*`, neměnit chování ostatních modulů).

## Provoz

- Dev server Vojty typicky běží na portu 3000 — nikdy nezabíjet procesy podle jména.
- Produkci nasazuje Michal; commity držet v modulových souborech, sdílené soubory měnit jen po dohodě.
