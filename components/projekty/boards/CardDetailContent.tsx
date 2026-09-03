"use client";

import { Button } from "@/components/ui/button";
import { Archive } from "lucide-react";
import { CardDescriptionEditor } from "./CardDescriptionEditor";
import { CardChecklistSection, type Checklist } from "./CardChecklistSection";
import { CardCommentsSection } from "./CardCommentsSection";
import { CardDetailHeader } from "./CardDetailHeader";
import { CardDetailMore } from "./CardDetailMore";
import type { CardPriorityValue } from "@/lib/projekty/priority";

type UserLite = { id: number; email: string | null; name: string | null; image: string | null };
type Label = { id: string; name: string; color: string };

export type FullCard = {
  id: string;
  number: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  startDate: string | null;
  completed: boolean;
  archived: boolean;
  priority: CardPriorityValue | null;
  list: {
    id: string;
    name: string;
    board: {
      id: string;
      ownerId: number;
      members: { userId: number; user: UserLite }[];
      labels: Label[];
    };
  };
  members: { userId: number; user: UserLite }[];
  labels: { labelId: string; label: Label }[];
  checklists: Checklist[];
};

/**
 * Prezentační tělo detailu karty — sdílené mezi side panelem (CardDetailPanel)
 * a plnou stránkou (CardDetailPage). Data a mutační logika žijí v containeru.
 */
export function CardDetailContent({
  card,
  currentUserId,
  onPatch,
  onCardChange,
  onArchive,
}: {
  card: FullCard;
  currentUserId: number;
  onPatch: (patch: Record<string, unknown>) => Promise<void>;
  onCardChange: (updater: (prev: FullCard) => FullCard) => void;
  onArchive: () => void;
}) {
  const boardMembersForPicker = card.list.board.members.map((m) => m.user);

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

      <div className="flex items-center justify-end pt-2 text-xs text-muted-foreground">
        <Button variant="ghost" size="sm" onClick={onArchive}>
          <Archive className="size-3.5" /> Archivovat
        </Button>
      </div>
    </div>
  );
}
