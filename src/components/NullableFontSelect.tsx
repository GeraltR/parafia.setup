import { FontSelect } from "@/components/FontSelect"
import type { FontFamily } from "@/api/fonts"

export function NullableFontSelect({
  value,
  onChange,
  fonts,
}: {
  value: string | null
  onChange: (value: string | null) => void
  fonts: FontFamily[]
}) {
  return (
    <FontSelect
      value={value ?? ""}
      onChange={(v) => onChange(v === "" ? null : v)}
      fonts={fonts}
      allowDefault
    />
  )
}
