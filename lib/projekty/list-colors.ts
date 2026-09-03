export type ListColor = {
  /** Perzistentní klíč ukládaný v DB (BoardList.color). */
  value: string;
  /** CSS color pro 8 px tečku v hlavičce (plná sytost, bez alpha). */
  dot: string;
  /** Lidský label (CZ) pro picker tooltip + a11y. */
  label: string;
};

export const LIST_PRESET_COLORS: readonly ListColor[] = [
  {
    value: "neutral",
    dot: "hsl(215 16% 47%)",
    label: "Neutrální",
  },
  {
    value: "info",
    dot: "hsl(217 91% 60%)",
    label: "Modrá",
  },
  {
    value: "purple",
    dot: "hsl(270 70% 55%)",
    label: "Fialová",
  },
  {
    value: "warning",
    dot: "hsl(38 92% 50%)",
    label: "Oranžová",
  },
  {
    value: "success",
    dot: "hsl(152 69% 41%)",
    label: "Zelená",
  },
  {
    value: "destructive",
    dot: "hsl(0 72% 51%)",
    label: "Červená",
  },
  {
    value: "cyan",
    dot: "hsl(190 75% 45%)",
    label: "Azurová",
  },
  {
    value: "pink",
    dot: "hsl(330 75% 55%)",
    label: "Růžová",
  },
] as const;

export const LIST_COLOR_VALUES = LIST_PRESET_COLORS.map((c) => c.value);

const NEUTRAL: ListColor = LIST_PRESET_COLORS[0]!;

export function defaultListColor(existingCount: number): ListColor {
  return LIST_PRESET_COLORS[existingCount % LIST_PRESET_COLORS.length] ?? NEUTRAL;
}

export function findListColor(value: string | null): ListColor {
  if (!value) return NEUTRAL;
  return LIST_PRESET_COLORS.find((c) => c.value === value) ?? NEUTRAL;
}
