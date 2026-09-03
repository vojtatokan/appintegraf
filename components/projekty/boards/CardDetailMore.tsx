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
