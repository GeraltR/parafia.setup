import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CardAction } from "@/components/ui/card"
import type { InfoItem } from "@/types/config"

export function InfoItemList({
  items,
  canWrite,
  onAdd,
  onEdit,
  onDelete,
}: {
  items: InfoItem[]
  canWrite: boolean
  onAdd: () => void
  onEdit: (item: InfoItem) => void
  onDelete: (item: InfoItem) => void
}) {
  return (
    <>
      {canWrite && (
        <CardAction>
          <Button type="button" size="sm" onClick={onAdd}>
            <Plus /> Dodaj informację
          </Button>
        </CardAction>
      )}
      <div className="grid gap-3 p-(--card-spacing)">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">Brak informacji.</p>
        )}
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`flex items-center gap-4 rounded-lg border p-3 ${
              index % 2 === 1 ? "bg-muted/40" : ""
            }`}
          >
            <div
              className="h-12 w-16 shrink-0 rounded-md border bg-muted bg-cover bg-center"
              style={item.image ? { backgroundImage: `url(${item.image})` } : undefined}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{item.title}</p>
              <p className="truncate text-sm text-muted-foreground">
                {item.validFrom} – {item.validTo}
                {item.author && ` · ${item.author.name}`}
              </p>
            </div>
            {canWrite && (
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => onEdit(item)}>
                  Edytuj
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => onDelete(item)}
                >
                  <Trash2 />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
