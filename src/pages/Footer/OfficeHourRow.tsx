import { Trash2 } from "lucide-react"
import type { Control } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import type { FooterFormValues } from "./schema"

export function OfficeHourRow({
  control,
  index,
  onRemove,
}: {
  control: Control<FooterFormValues>
  index: number
  onRemove: () => void
}) {
  return (
    <div
      className={`grid grid-cols-[1fr_auto_auto_auto] items-end gap-3 rounded-lg border p-3 ${
        index % 2 === 1 ? "bg-muted/40" : ""
      }`}
    >
      <FormField
        control={control}
        name={`officeHours.${index}.day`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Dzień</FormLabel>
            <FormControl>
              <Input placeholder="Poniedziałek" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`officeHours.${index}.hoursOn`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Od</FormLabel>
            <FormControl>
              <Input placeholder="16:00" className="w-24" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`officeHours.${index}.hoursEnd`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Do</FormLabel>
            <FormControl>
              <Input placeholder="17:30" className="w-24" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button type="button" variant="destructive" size="icon" onClick={onRemove}>
        <Trash2 />
      </Button>
    </div>
  )
}
