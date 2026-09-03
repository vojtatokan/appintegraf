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
              ? "border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500 dark:text-emerald-950"
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
