import type { Control } from "react-hook-form"

import type { FontFamily } from "@/api/fonts"
import { ColorField } from "@/components/ColorField"
import { FontSelect } from "@/components/FontSelect"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { TEXT_BLOCK_FIELDS, V_ALIGN_LABELS } from "@/lib/fieldOptions"

import type { HeroFormValues } from "./schema"

export function HeroTextBlock({
  control,
  prefix,
  label,
  multiline,
  fonts,
}: {
  control: Control<HeroFormValues>
  prefix: keyof typeof TEXT_BLOCK_FIELDS
  label: string
  multiline?: boolean
  fonts: FontFamily[]
}) {
  const fields = TEXT_BLOCK_FIELDS[prefix]

  return (
    <div className="grid gap-4 rounded-lg border p-4">
      <FormField
        control={control}
        name={fields.text}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              {multiline ? (
                <Textarea {...field} value={field.value as string} />
              ) : (
                <Input {...field} value={field.value as string} />
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-4 gap-4">
        <FormField
          control={control}
          name={fields.width}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Szerokość (1–12)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={12}
                  className="w-20"
                  name={field.name}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  value={field.value as number}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={fields.font}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Font</FormLabel>
              <FontSelect
                value={field.value as string}
                onChange={field.onChange}
                fonts={fonts}
                allowDefault
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={fields.vAlign}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Wyrównanie</FormLabel>
              <Select value={field.value as string} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {(value: string) => V_ALIGN_LABELS[value as keyof typeof V_ALIGN_LABELS]}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(V_ALIGN_LABELS).map(([value, valueLabel]) => (
                    <SelectItem key={value} value={value}>
                      {valueLabel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {fields.color && (
          <ColorField
            control={control}
            name={fields.color}
            label="Kolor tekstu"
            fallback="#ffffff"
          />
        )}
      </div>
    </div>
  )
}
