import { Trash2 } from "lucide-react"
import type { Control } from "react-hook-form"

import { ColorField } from "@/components/ColorField"
import { Button } from "@/components/ui/button"
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
import { Switch } from "@/components/ui/switch"
import { ICON_LABELS } from "@/lib/fieldOptions"

import type { HeroFormValues } from "./schema"

export function HeroButtonRow({
  control,
  index,
  onRemove,
}: {
  control: Control<HeroFormValues>
  index: number
  onRemove: () => void
}) {
  return (
    <div className={`grid gap-4 rounded-lg border p-4 ${index % 2 === 1 ? "bg-muted/40" : ""}`}>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name={`buttons.${index}.label`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Etykieta</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`buttons.${index}.href`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="flex items-end gap-4">
        <FormField
          control={control}
          name={`buttons.${index}.icon`}
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Ikona</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {(value: string) => ICON_LABELS[value as keyof typeof ICON_LABELS]}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(ICON_LABELS).map(([value, valueLabel]) => (
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
        <FormField
          control={control}
          name={`buttons.${index}.external`}
          render={({ field }) => (
            <FormItem className="flex items-center gap-2 space-y-0 pb-2">
              <FormControl>
                <Switch checked={field.value ?? false} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className="!mt-0">Nowa karta</FormLabel>
            </FormItem>
          )}
        />
        <Button type="button" variant="destructive" size="icon" onClick={onRemove}>
          <Trash2 />
        </Button>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <ColorField
          control={control}
          name={`buttons.${index}.textColor`}
          label="Tekst"
          fallback="#ffffff"
        />
        <ColorField
          control={control}
          name={`buttons.${index}.bgColor`}
          label="Tło"
          fallback="#0a1428"
        />
        <ColorField
          control={control}
          name={`buttons.${index}.textColorHover`}
          label="Tekst (hover)"
          fallback="#0a1428"
        />
        <ColorField
          control={control}
          name={`buttons.${index}.bgColorHover`}
          label="Tło (hover)"
          fallback="#ffffff"
        />
      </div>
    </div>
  )
}
