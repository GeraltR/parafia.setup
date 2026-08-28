import { Trash2 } from "lucide-react"
import type { Control } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import type { MassAndPastorFormValues } from "./schema"

export function MassTimeRow({
  control,
  index,
  onRemove,
}: {
  control: Control<MassAndPastorFormValues>
  index: number
  onRemove: () => void
}) {
  return (
    <div className="grid gap-3 rounded-lg border p-3">
      <div className="flex items-end gap-3">
        <FormField
          control={control}
          name={`massTimes.${index}.label`}
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Etykieta</FormLabel>
              <FormControl>
                <Input placeholder="Niedziela i święta" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="button" variant="destructive" size="icon" onClick={onRemove}>
          <Trash2 />
        </Button>
      </div>
      <FormField
        control={control}
        name={`massTimes.${index}.hours`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Godziny (oddzielone przecinkiem)</FormLabel>
            <FormControl>
              <Input placeholder="7:30, 9:30, 11:30, 18:00" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`massTimes.${index}.note`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notatka (opcjonalnie)</FormLabel>
            <FormControl>
              <Input
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value || null)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
