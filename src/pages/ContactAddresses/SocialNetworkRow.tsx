import type { Control } from "react-hook-form"

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

import type { ContactAddressFormValues } from "./schema"

export function SocialNetworkRow({
  control,
  index,
  label,
}: {
  control: Control<ContactAddressFormValues>
  index: number
  label: string
}) {
  return (
    <div
      className={`grid grid-cols-[8rem_1fr_auto] items-end gap-4 rounded-lg border p-4 ${
        index % 2 === 1 ? "bg-muted/40" : ""
      }`}
    >
      <span className="pb-2 text-sm font-medium">{label}</span>
      <FormField
        control={control}
        name={`social.${index}.link`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Link</FormLabel>
            <FormControl>
              <Input placeholder="https://…" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`social.${index}.visibility`}
        render={({ field }) => (
          <FormItem className="flex items-center gap-2 space-y-0 pb-2">
            <Switch checked={field.value} onCheckedChange={field.onChange} />
            <FormLabel className="!mt-0">Widoczny</FormLabel>
          </FormItem>
        )}
      />
    </div>
  )
}
