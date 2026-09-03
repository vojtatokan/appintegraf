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
