"use client";

import { Fragment, useState } from "react";
import { Plus } from "lucide-react";
import { useDndContext } from "@dnd-kit/core";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { findListColor } from "@/lib/projekty/list-colors";
import { cn } from "@/lib/projekty/utils";
import { BoardListMenu } from "./BoardListMenu";
import { CardItem, type CardData } from "./CardItem";
import { CardQuickAdd } from "./CardQuickAdd";
import { DropLine } from "./DropLine";

export type ListData = {
  id: string;
  boardId: string;
  name: string;
  color: string | null;
  position: number;
  archived: boolean;
  cards: CardData[];
};

export function BoardListColumn({
  list,
  orderedCardIds,
  onListUpdate,
  onListDelete,
  onListArchive,
  onCardCreated,
  quickAddOpen: quickAddOpenProp,
  onQuickAddOpenChange,
}: {
  list: ListData;
  orderedCardIds: string[];
  onListUpdate: (l: ListData) => void;
  onListDelete: (id: string) => void;
  onListArchive?: (id: string, archived: boolean) => void;
  onCardCreated?: (listId: string, card: CardData) => void;
  /** Řízený stav quick-add řádku zvenčí (BoardToolbar „Nová karta"); bez prop = lokální stav. */
  quickAddOpen?: boolean;
  onQuickAddOpenChange?: (open: boolean) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(list.name);
  const [internalOpen, setInternalOpen] = useState(false);
  const quickAddOpen = quickAddOpenProp ?? internalOpen;
  function setQuickAddOpen(next: boolean) {
    setInternalOpen(next);
    onQuickAddOpenChange?.(next);
  }
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: list.id,
    data: { type: "list" },
  });

  const colorPreset = findListColor(list.color);
  const totalCount = list.cards.length;
  const completedCount = list.cards.filter((c) => c.completed).length;

  const { active, over } = useDndContext();
  const draggingCardId =
    active?.data.current?.type === "card" ? String(active.id) : null;
  const overCardId =
    over?.data.current?.type === "card" ? String(over.id) : null;
  const overListIdForCard =
    over?.data.current?.type === "card"
      ? String(over.data.current.listId ?? "")
      : over?.data.current?.type === "list"
        ? String(over.id)
        : null;
  const isDraggingCardOverThisList =
    draggingCardId !== null && overListIdForCard === list.id;

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Notion-style: originál sloupce zůstává jako "fantom" na své pozici (0.5);
    // ghost u kursoru je primární focus (DragOverlay).
    opacity: isDragging ? 0.5 : 1,
  };

  async function handleRename() {
    if (name.trim() === list.name || !name.trim()) {
      setName(list.name);
      setEditing(false);
      return;
    }
    const res = await fetch(`/api/projekty/lists/${list.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    if (res.ok) {
      const { list: updated } = (await res.json()) as { list: Omit<ListData, "cards"> };
      onListUpdate({ ...list, ...updated, cards: list.cards });
    } else {
      setName(list.name);
    }
    setEditing(false);
  }

  // Sloupec drag handle = celý header (kromě edit inputu a ⋯ menu — ty mají
  // onPointerDown stopPropagation níže). Karta drag je řešena uvnitř CardItem.
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group/list flex h-full w-[272px] shrink-0 snap-start flex-col rounded-lg p-1 transition-colors duration-150 motion-reduce:transition-none",
        isDraggingCardOverThisList && "bg-projekty-accent-soft",
      )}
    >
      <div
        aria-label={`Přesunout sloupec ${list.name}`}
        {...attributes}
        {...listeners}
        className="mb-1 flex h-9 cursor-grab touch-none items-center gap-2 px-1 active:cursor-grabbing"
      >
        <span
          className="size-2 shrink-0 rounded-full"
          style={{ backgroundColor: colorPreset.dot }}
          aria-hidden
        />
        {editing ? (
          <input
            className="min-w-0 flex-1 rounded bg-card px-2 py-0.5 text-[13px] font-medium text-foreground outline-none ring-1 ring-border focus:ring-ring"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => void handleRename()}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleRename();
              if (e.key === "Escape") {
                setName(list.name);
                setEditing(false);
              }
            }}
            autoFocus
            onPointerDown={(e) => e.stopPropagation()}
          />
        ) : (
          <h3
            className="cursor-pointer truncate text-[13px] font-medium text-foreground"
            onClick={() => setEditing(true)}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {list.name}
          </h3>
        )}
        <span className="ml-0.5 text-xs tabular-nums text-muted-foreground">{totalCount}</span>
        <div
          className="ml-auto opacity-0 transition-opacity group-hover/list:opacity-100 focus-within:opacity-100"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <BoardListMenu
            list={list}
            onDelete={() => onListDelete(list.id)}
            onArchive={(archived) => onListArchive?.(list.id, archived)}
            onColorChange={(color) => onListUpdate({ ...list, color })}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto">
        <SortableContext
          items={list.cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-1.5">
            {list.cards.map((card) => {
              const showLineBefore =
                isDraggingCardOverThisList &&
                draggingCardId !== card.id &&
                overCardId === card.id;
              return (
                <Fragment key={card.id}>
                  {showLineBefore ? <DropLine orientation="horizontal" /> : null}
                  <CardItem card={card} boardId={list.boardId} orderedCardIds={orderedCardIds} />
                </Fragment>
              );
            })}
            {/* Drop na konci listu: over je list ID (nebo prázdný list) */}
            {isDraggingCardOverThisList && overCardId === null ? (
              <DropLine orientation="horizontal" />
            ) : null}
          </div>
        </SortableContext>

        {completedCount > 0 ? (
          <div className="mt-2 px-1 text-[11px] text-muted-foreground">
            {completedCount} dokončeno
          </div>
        ) : null}

        {!quickAddOpen ? (
          <button
            type="button"
            onClick={() => setQuickAddOpen(true)}
            onPointerDown={(e) => e.stopPropagation()}
            className="mt-1 flex h-8 w-full items-center gap-1.5 rounded-md px-2 text-[13px] text-muted-foreground transition-colors duration-150 hover:bg-card hover:text-foreground motion-reduce:transition-none"
          >
            <Plus className="size-3.5" strokeWidth={2} /> Nová karta
          </button>
        ) : null}

        <CardQuickAdd
          listId={list.id}
          open={quickAddOpen}
          onOpenChange={setQuickAddOpen}
          onCreated={(card) => onCardCreated?.(list.id, card)}
        />
      </div>
    </div>
  );
}

/**
 * Static snapshot sloupce pro <DragOverlay>. Jen header + count, žádné karty
 * (jinak by se nested SortableContext registroval do DndContext s duplikátními ID).
 */
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
