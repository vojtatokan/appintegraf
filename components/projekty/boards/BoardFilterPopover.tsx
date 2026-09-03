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
