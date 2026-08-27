import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function OrderSelect({
  value,
  max,
  onChange,
}: {
  value: number
  max: number
  onChange: (position: number) => void
}) {
  const options = Array.from({ length: max }, (_, i) => i + 1)

  return (
    <Select value={String(value)} onValueChange={(v) => onChange(Number(v))}>
      <SelectTrigger className="w-16" size="sm">
        <SelectValue>{(v: string) => v}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((position) => (
          <SelectItem key={position} value={String(position)}>
            {position}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
