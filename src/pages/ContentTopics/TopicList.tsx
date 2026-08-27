import { Plus, Printer, Trash2 } from "lucide-react"

import { TopicIcon } from "@/components/TopicIcon"
import { Button } from "@/components/ui/button"
import { CardAction } from "@/components/ui/card"
import { printContent } from "@/lib/printContent"
import type { ContentPageSlug, ContentTopic } from "@/types/config"

export function TopicList({
  page,
  topics,
  maxTopics,
  canWrite,
  onAdd,
  onEdit,
  onDelete,
}: {
  page: ContentPageSlug
  topics: ContentTopic[]
  maxTopics?: number
  canWrite: boolean
  onAdd: () => void
  onEdit: (topic: ContentTopic) => void
  onDelete: (topic: ContentTopic) => void
}) {
  const canPrint = page !== "sakramenty"
  const showMeta = page !== "sakramenty"
  const canAddMore = maxTopics === undefined || topics.length < maxTopics

  return (
    <>
      {canWrite && canAddMore && (
        <CardAction>
          <Button type="button" size="sm" onClick={onAdd}>
            <Plus /> Dodaj temat
          </Button>
        </CardAction>
      )}
      <div className="grid gap-3 p-(--card-spacing)">
        {topics.length === 0 && (
          <p className="text-sm text-muted-foreground">Brak tematów w tej sekcji.</p>
        )}
        {topics.map((topic) => (
          <div
            key={topic.id}
            className="flex items-center gap-4 rounded-lg border p-3"
          >
            <TopicIcon iconUrl={topic.iconUrl} className="size-10 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{topic.title}</p>
              {showMeta && (
                <p className="truncate text-sm text-muted-foreground">
                  {topic.author?.name ?? "Brak autora"}
                  {topic.visibleFrom &&
                    ` · widoczna od ${new Date(topic.visibleFrom).toLocaleString("pl-PL")}`}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {canPrint && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  title="Drukuj treść"
                  onClick={() => printContent(topic.content)}
                >
                  <Printer />
                </Button>
              )}
              {canWrite && (
                <>
                  <Button type="button" variant="outline" size="sm" onClick={() => onEdit(topic)}>
                    Edytuj
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => onDelete(topic)}
                  >
                    <Trash2 />
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
