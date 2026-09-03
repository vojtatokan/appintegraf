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
import { boardViewQuery, parseBoardView, type BoardViewType } from "@/lib/projekty/board-view";
import type { BoardStats } from "@/lib/projekty/board-stats";
import { cn } from "@/lib/projekty/utils";
import { BoardFilterPopover } from "./BoardFilterPopover";

type UserLite = { id: number; email: string | null; name: string | null; image: string | null };
type Label = { id: string; name: string; color: string };

const VIEWS: { value: BoardViewType; label: string; Icon: typeof Columns }[] = [
  { value: "kanban", label: "Nástěnka", Icon: Columns },
  { value: "list", label: "Seznam", Icon: ListIcon },
  { value: "calendar", label: "Kalendář", Icon: CalendarDays },
];

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
    const qs = boardViewQuery(searchParams, value);
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`);
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
