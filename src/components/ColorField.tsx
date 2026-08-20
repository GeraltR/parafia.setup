import { HexColorPicker } from "react-colorful"
import type { Control, FieldPath, FieldValues } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { HEX_COLOR_PATTERN } from "@/lib/colors"

export function ColorField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  fallback,
  allowClear = true,
}: {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  label: string
  fallback: string
  /** Whether the field can be cleared back to "no value" (null). Set to false for required fields. */
  allowClear?: boolean
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const value = field.value as string | null
        const swatchValue = value && HEX_COLOR_PATTERN.test(value) ? value : fallback
        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <Popover>
              <FormControl>
                <PopoverTrigger
                  type="button"
                  className="h-8 w-10 shrink-0 rounded-md border border-input"
                  style={{ backgroundColor: swatchValue }}
                />
              </FormControl>
              <PopoverContent className="grid w-56 gap-3">
                <HexColorPicker color={swatchValue} onChange={field.onChange} />
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    className="flex-1 font-mono"
                    placeholder={fallback}
                    value={value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        allowClear && e.target.value === "" ? null : e.target.value
                      )
                    }
                  />
                  {allowClear && value !== null && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => field.onChange(null)}
                    >
                      Domyślny
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}
