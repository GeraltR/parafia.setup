import { Plus, Trash2 } from "lucide-react"
import { useFieldArray, type Control } from "react-hook-form"

import { OrderSelect } from "@/components/OrderSelect"
import { Button } from "@/components/ui/button"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import type { NavbarFormValues } from "./schema"

export function NavItemRow({
  control,
  index,
  total,
  isLocked,
  onRemove,
  onMove,
}: {
  control: Control<NavbarFormValues>
  index: number
  total: number
  isLocked: boolean
  onRemove: () => void
  onMove: (position: number) => void
}) {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: `items.${index}.children`,
  })

  return (
    <div className={`grid gap-4 rounded-lg border p-4 ${index % 2 === 1 ? "bg-muted/40" : ""}`}>
      <div className="flex items-end gap-4">
        <FormField
          control={control}
          name={`items.${index}.label`}
          render={({ field }) => (
            <FormItem className="flex-1">
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
          name={`items.${index}.href`}
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Link</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-2">
          <span className="text-sm font-medium">Kolejność</span>
          <OrderSelect
            value={index + 1}
            max={total}
            onChange={(position) => onMove(position - 1)}
          />
        </div>
        {isLocked ? (
          <span className="pb-2 text-sm text-muted-foreground">Domyślna pozycja</span>
        ) : (
          <Button type="button" variant="destructive" size="icon" onClick={onRemove}>
            <Trash2 />
          </Button>
        )}
      </div>

      <div className="grid gap-3 border-l-2 pl-4">
        {fields.map((childField, childIndex) => (
          <div
            key={childField.id}
            className={`flex items-end gap-4 rounded-md p-2 ${childIndex % 2 === 1 ? "bg-muted/40" : ""}`}
          >
            <FormField
              control={control}
              name={`items.${index}.children.${childIndex}.label`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Etykieta podpozycji</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`items.${index}.children.${childIndex}.href`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Link</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-2">
              <span className="text-sm font-medium">Kolejność</span>
              <OrderSelect
                value={childIndex + 1}
                max={fields.length}
                onChange={(position) => move(childIndex, position - 1)}
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => remove(childIndex)}
            >
              <Trash2 />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="justify-self-start"
          onClick={() => append({ label: "", href: "" })}
        >
          <Plus /> Dodaj podpozycję
        </Button>
      </div>
    </div>
  )
}
