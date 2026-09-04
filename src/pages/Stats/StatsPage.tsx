import { useEffect, useState } from "react"

import { pageViewsApi, type PageViewSummary } from "@/api/pageViews"
import { DailyViewsChart } from "@/components/DailyViewsChart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const PERIODS = [
  { days: 7, label: "7 dni" },
  { days: 30, label: "30 dni" },
  { days: 90, label: "90 dni" },
]

export function StatsPage() {
  const [days, setDays] = useState(30)
  const [summary, setSummary] = useState<PageViewSummary | null>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")

  useEffect(() => {
    setStatus("loading")
    pageViewsApi
      .summary(days)
      .then((data) => {
        setSummary(data)
        setStatus("ready")
      })
      .catch(() => setStatus("error"))
  }, [days])

  return (
    <Card className="max-w-3xl overflow-visible">
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Statystyki odwiedzin</CardTitle>
        <div className="flex gap-2">
          {PERIODS.map((period) => (
            <Button
              key={period.days}
              type="button"
              size="sm"
              variant={days === period.days ? "default" : "outline"}
              onClick={() => setDays(period.days)}
            >
              {period.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="grid gap-6">
        {status === "loading" && <p className="text-sm text-muted-foreground">Ładowanie…</p>}
        {status === "error" && (
          <p className="text-sm text-destructive">Nie udało się wczytać statystyk.</p>
        )}
        {status === "ready" && summary && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-4">
                <div className="text-xs text-muted-foreground">Odsłony</div>
                <div className="text-2xl font-bold">{summary.totalViews}</div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-xs text-muted-foreground">Unikalni odwiedzający</div>
                <div className="text-2xl font-bold">{summary.totalUniqueVisitors}</div>
              </div>
            </div>

            <DailyViewsChart data={summary.daily} />

            <div>
              <h3 className="mb-2 text-sm font-semibold">Najpopularniejsze podstrony</h3>
              {summary.topPaths.length === 0 ? (
                <p className="text-sm text-muted-foreground">Brak danych w wybranym okresie.</p>
              ) : (
                <div className="grid gap-1">
                  {summary.topPaths.map((row) => (
                    <div
                      key={row.path}
                      className="flex items-center justify-between border-b py-1.5 text-sm last:border-0"
                    >
                      <span className={cn("truncate font-mono text-xs")}>{row.path}</span>
                      <span className="text-muted-foreground">{row.views}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
