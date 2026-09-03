import { Plus, Printer, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CardAction } from "@/components/ui/card"
import type { MassIntention, MassIntentionsConfig } from "@/types/config"

interface DayGroup {
  date: string;
  isHoliday: boolean;
  dayDescription: string | null;
  rows: MassIntention[];
}

function groupByDay(items: MassIntention[]): DayGroup[] {
  const groups: DayGroup[] = []
  for (const item of items) {
    const last = groups[groups.length - 1]
    if (last && last.date === item.date) {
      last.rows.push(item)
    } else {
      groups.push({ date: item.date, isHoliday: item.isHoliday, dayDescription: item.dayDescription, rows: [item] })
    }
  }
  return groups
}

function dayColor(config: MassIntentionsConfig, group: DayGroup): string {
  if (group.isHoliday && group.dayDescription) return config.holidayDescribedColor
  if (group.isHoliday) return config.holidayPlainColor
  return config.weekdayColor
}

function formatDatePl(iso: string): string {
  const [year, month, day] = iso.split("-")
  return `${day}.${month}.${year}`
}

export function IntentionList({
  items,
  config,
  canWrite,
  onAdd,
  onEdit,
  onDelete,
  onPrint,
}: {
  items: MassIntention[]
  config: MassIntentionsConfig
  canWrite: boolean
  onAdd: () => void
  onEdit: (intention: MassIntention) => void
  onDelete: (intention: MassIntention) => void
  onPrint: () => void
}) {
  const groups = groupByDay(items)

  return (
    <>
      <CardAction className="flex gap-2 px-(--card-spacing)">
        <Button type="button" variant="outline" size="sm" onClick={onPrint}>
          <Printer /> Drukuj
        </Button>
        {canWrite && (
          <Button type="button" size="sm" onClick={onAdd}>
            <Plus /> Dodaj intencję
          </Button>
        )}
      </CardAction>
      <div className="grid grid-cols-1 gap-4 p-(--card-spacing)">
        {groups.length === 0 && (
          <p className="text-sm text-muted-foreground">Brak intencji.</p>
        )}
        {groups.map((group) => (
          <div key={group.date} className="overflow-hidden rounded-lg border">
            <div
              className="px-3 py-2 text-sm font-semibold text-black"
              style={{ backgroundColor: dayColor(config, group) }}
            >
              {formatDatePl(group.date)}
              {group.dayDescription && ` — ${group.dayDescription}`}
            </div>
            {group.rows.map((row) => (
              <div key={row.id} className="flex items-center gap-4 border-t p-3">
                <span className="w-16 shrink-0 font-medium">{row.time}</span>
                <p className="min-w-0 flex-1 truncate">{row.intention}</p>
                {canWrite && (
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => onEdit(row)}>
                      Edytuj
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => onDelete(row)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  )
}
