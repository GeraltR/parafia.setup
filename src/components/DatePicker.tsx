import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const WEEKDAY_LABELS_PL = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"]
const MONTH_LABELS_PL = [
  "styczeń",
  "luty",
  "marzec",
  "kwiecień",
  "maj",
  "czerwiec",
  "lipiec",
  "sierpień",
  "wrzesień",
  "październik",
  "listopad",
  "grudzień",
]

function toIso(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function formatDisplay(iso: string): string {
  const [year, month, day] = iso.split("-")
  return `${day}.${month}.${year}`
}

function buildMonthGrid(year: number, month: number): Date[] {
  const firstOfMonth = new Date(year, month, 1)
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7 // Monday-first
  const start = new Date(year, month, 1 - firstWeekday)
  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    return date
  })
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Wybierz datę",
  id,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  id?: string
}) {
  const initial = value ? new Date(`${value}T00:00:00`) : new Date()
  const [open, setOpen] = useState(false)
  const [viewYear, setViewYear] = useState(initial.getFullYear())
  const [viewMonth, setViewMonth] = useState(initial.getMonth())

  const days = buildMonthGrid(viewYear, viewMonth)

  function goPrevMonth() {
    const date = new Date(viewYear, viewMonth - 1, 1)
    setViewYear(date.getFullYear())
    setViewMonth(date.getMonth())
  }

  function goNextMonth() {
    const date = new Date(viewYear, viewMonth + 1, 1)
    setViewYear(date.getFullYear())
    setViewMonth(date.getMonth())
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={id}
        type="button"
        className="flex h-9 w-full items-center rounded-md border border-input bg-transparent px-3 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {value ? (
          formatDisplay(value)
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            onClick={goPrevMonth}
            className="rounded p-1 text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="text-sm font-medium text-foreground capitalize">
            {MONTH_LABELS_PL[viewMonth]} {viewYear}
          </span>
          <button
            type="button"
            onClick={goNextMonth}
            className="rounded p-1 text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
          {WEEKDAY_LABELS_PL.map((weekday) => (
            <div key={weekday} className="py-1">
              {weekday}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((date) => {
            const iso = toIso(date)
            const isCurrentMonth = date.getMonth() === viewMonth
            const isSelected = iso === value
            return (
              <button
                key={iso}
                type="button"
                onClick={() => {
                  onChange(iso)
                  setOpen(false)
                }}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-md text-sm text-foreground hover:bg-accent hover:text-accent-foreground",
                  !isCurrentMonth && "text-muted-foreground/50",
                  isSelected &&
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                )}
              >
                {date.getDate()}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
