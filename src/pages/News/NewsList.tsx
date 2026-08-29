import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CardAction } from "@/components/ui/card"
import type { NewsItem } from "@/types/config"

export function NewsList({
  news,
  canWrite,
  onAdd,
  onEdit,
  onDelete,
}: {
  news: NewsItem[]
  canWrite: boolean
  onAdd: () => void
  onEdit: (news: NewsItem) => void
  onDelete: (news: NewsItem) => void
}) {
  return (
    <>
      {canWrite && (
        <CardAction>
          <Button type="button" size="sm" onClick={onAdd}>
            <Plus /> Dodaj aktualność
          </Button>
        </CardAction>
      )}
      <div className="grid gap-3 p-(--card-spacing)">
        {news.length === 0 && (
          <p className="text-sm text-muted-foreground">Brak aktualności.</p>
        )}
        {news.map((item, index) => (
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
                {item.date}
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
