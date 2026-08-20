import type { FontFamily } from "@/api/fonts"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const DEFAULT_VALUE = ""
const DEFAULT_LABEL = "Domyślna (z motywu)"

export function FontSelect({
  value,
  onChange,
  fonts,
  allowDefault,
}: {
  value: string
  onChange: (value: string) => void
  fonts: FontFamily[]
  allowDefault?: boolean
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v ?? DEFAULT_VALUE)}>
      <SelectTrigger className="w-full">
        <SelectValue>{(v: string) => (v === DEFAULT_VALUE ? DEFAULT_LABEL : v)}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {allowDefault && <SelectItem value={DEFAULT_VALUE}>{DEFAULT_LABEL}</SelectItem>}
        {fonts.length === 0 && (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            Brak czcionek w folderze fonts
          </div>
        )}
        {fonts.map((font) => (
          <SelectItem key={font.family} value={font.family} style={{ fontFamily: font.family }}>
            {font.family}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
