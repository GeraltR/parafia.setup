import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { EventItem } from "@/types/config"

export function EventList({
  events,
  canWrite,
  onEdit,
  onDelete,
}: {
  events: EventItem[]
  canWrite: boolean
  onEdit: (event: EventItem) => void
  onDelete: (event: EventItem) => void
}) {
  return (
    <>
      <div className="grid grid-cols-1 gap-3 p-(--card-spacing)">
        {events.length === 0 && (
          <p className="text-sm text-muted-foreground">Brak wydarzeń.</p>
        )}
        {events.map((event, index) => (
          <div
            key={event.id}
            className={`flex items-center gap-4 rounded-lg border p-3 ${
              index % 2 === 1 ? "bg-muted/40" : ""
            }`}
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{event.title}</p>
              <p className="truncate text-sm text-muted-foreground">
                {event.date} · {event.time}
                {event.author && ` · ${event.author.name}`}
              </p>
            </div>
            {canWrite && (
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => onEdit(event)}>
                  Edytuj
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => onDelete(event)}
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
