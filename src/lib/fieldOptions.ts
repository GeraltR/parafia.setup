import { z } from "zod"

export const vAlignSchema = z.enum(["top", "center", "bottom"])
export const iconSchema = z.enum(["mass", "announcements", "live"])

export const V_ALIGN_LABELS: Record<z.infer<typeof vAlignSchema>, string> = {
  top: "Góra",
  center: "Środek",
  bottom: "Dół",
}

export const ICON_LABELS: Record<z.infer<typeof iconSchema>, string> = {
  mass: "Msza święta",
  announcements: "Ogłoszenia",
  live: "Transmisja na żywo",
}

// Field-name mapping for a grouped text block (text + width + font + vAlign + optional color).
// Values are Hero's own field names; a future page reusing this shape defines its own map.
export const TEXT_BLOCK_FIELDS = {
  title: {
    text: "title",
    width: "titleWidth",
    font: "titleFont",
    vAlign: "titleVAlign",
    color: "titleColor",
  },
  subtitle: {
    text: "subtitle",
    width: "subtitleWidth",
    font: "subtitleFont",
    vAlign: "subtitleVAlign",
    color: "subtitleColor",
  },
  keynote: {
    text: "keynote",
    width: "keynoteWidth",
    font: "keynoteFont",
    vAlign: "keynoteVAlign",
    color: null,
  },
} as const
