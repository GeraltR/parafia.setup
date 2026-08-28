import type { Control, FieldPath, FieldValues } from "react-hook-form"

import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CUSTOM_LINK_VALUE, SITE_SECTIONS } from "@/lib/siteSections"

export function SiteLinkField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
}: {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  label: string
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const value = (field.value as string) ?? ""
        const knownSection = SITE_SECTIONS.some((section) => section.value === value)
        const selectValue = knownSection || value === "" ? value : CUSTOM_LINK_VALUE

        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <Select
              value={selectValue}
              onValueChange={(next) => {
                if (next !== CUSTOM_LINK_VALUE) {
                  field.onChange(next)
                } else {
                  field.onChange("")
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(v: string) =>
                    v === CUSTOM_LINK_VALUE
                      ? "Inny link (URL)"
                      : (SITE_SECTIONS.find((section) => section.value === v)?.label ?? "Inny link (URL)")
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {SITE_SECTIONS.map((section) => (
                  <SelectItem key={section.value} value={section.value}>
                    {section.label}
                  </SelectItem>
                ))}
                <SelectItem value={CUSTOM_LINK_VALUE}>Inny link (URL)</SelectItem>
              </SelectContent>
            </Select>
            {selectValue === CUSTOM_LINK_VALUE && (
              <Input
                value={value}
                onChange={(e) => field.onChange(e.target.value)}
                placeholder="https://…"
                className="mt-2"
              />
            )}
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}
