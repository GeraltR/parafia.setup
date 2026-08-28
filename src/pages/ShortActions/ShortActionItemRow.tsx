import { useController, type Control } from "react-hook-form"

import { shortActionsApi } from "@/api/shortActions"
import { IconPicker } from "@/components/IconPicker"
import { SiteLinkField } from "@/components/SiteLinkField"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

import { DEFAULT_ICONS, type ShortActionsFormValues } from "./schema"

export function ShortActionItemRow({
  control,
  index,
}: {
  control: Control<ShortActionsFormValues>
  index: number
}) {
  const { field: iconField } = useController({ control, name: `items.${index}.icon` })
  const { field: iconUrlField } = useController({ control, name: `items.${index}.iconUrl` })

  return (
    <div className={`grid gap-4 rounded-lg border p-4 ${index % 2 === 1 ? "bg-muted/40" : ""}`}>
      <div className="flex items-start gap-4">
        <div className="grid gap-2">
          <Label>Ikona</Label>
          <IconPicker
            icon={iconField.value}
            iconUrl={iconUrlField.value}
            defaultIcon={DEFAULT_ICONS[index] ?? "mass"}
            onChange={(icon, iconUrl) => {
              iconField.onChange(icon)
              iconUrlField.onChange(iconUrl)
            }}
            onUpload={async (file) => (await shortActionsApi.uploadIcon(file)).url}
          />
        </div>
        <div className="grid flex-1 grid-cols-2 gap-4">
          <FormField
            control={control}
            name={`items.${index}.title`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tytuł</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`items.${index}.description`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Podtytuł</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <SiteLinkField control={control} name={`items.${index}.href`} label="Link" />
        </div>
        <FormField
          control={control}
          name={`items.${index}.external`}
          render={({ field }) => (
            <FormItem className="flex items-center gap-2 space-y-0 pb-2">
              <Switch checked={field.value} onCheckedChange={field.onChange} />
              <FormLabel className="!mt-0">Nowa karta</FormLabel>
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
