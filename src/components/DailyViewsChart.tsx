import type { PageViewDailyPoint } from "@/api/pageViews"

function formatShortDate(iso: string): string {
  const [, month, day] = iso.split("-")
  return `${day}.${month}`
}

export function DailyViewsChart({ data }: { data: PageViewDailyPoint[] }) {
  const width = 800
  const height = 220
  const paddingLeft = 34
  const paddingRight = 10
  const paddingTop = 12
  const paddingBottom = 24
  const chartWidth = width - paddingLeft - paddingRight
  const chartHeight = height - paddingTop - paddingBottom

  const maxValue = Math.max(1, ...data.map((d) => d.views), ...data.map((d) => d.uniqueVisitors))
  const stepX = data.length > 1 ? chartWidth / (data.length - 1) : 0
  const yTicks = [0, 0.5, 1].map((fraction) => Math.round(maxValue * fraction))

  function pointsFor(key: "views" | "uniqueVisitors"): string {
    return data
      .map((point, index) => {
        const x = paddingLeft + index * stepX
        const y = paddingTop + chartHeight - (point[key] / maxValue) * chartHeight
        return `${x},${y}`
      })
      .join(" ")
  }

  return (
    <div className="grid gap-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full">
        {yTicks.map((tick) => {
          const y = paddingTop + chartHeight - (tick / maxValue) * chartHeight
          return (
            <g key={tick} className="text-muted-foreground">
              <line
                x1={paddingLeft}
                x2={width - paddingRight}
                y1={y}
                y2={y}
                stroke="currentColor"
                strokeOpacity={0.15}
              />
              <text x={0} y={y + 4} fontSize={10} fill="currentColor" opacity={0.7}>
                {tick}
              </text>
            </g>
          )
        })}

        <g className="text-blue-600 dark:text-blue-400">
          <polyline points={pointsFor("views")} fill="none" stroke="currentColor" strokeWidth={2} />
        </g>
        <g className="text-amber-500 dark:text-amber-400">
          <polyline
            points={pointsFor("uniqueVisitors")}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeDasharray="5 4"
          />
        </g>

        {data.length > 0 && (
          <g className="text-muted-foreground">
            <text x={paddingLeft} y={height - 4} fontSize={10} fill="currentColor" opacity={0.7}>
              {formatShortDate(data[0].date)}
            </text>
            <text
              x={width - paddingRight}
              y={height - 4}
              fontSize={10}
              fill="currentColor"
              opacity={0.7}
              textAnchor="end"
            >
              {formatShortDate(data[data.length - 1].date)}
            </text>
          </g>
        )}
      </svg>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2.5 rounded-full bg-blue-600 dark:bg-blue-400" />
          Odsłony
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2.5 rounded-full bg-amber-500 dark:bg-amber-400" />
          Unikalni odwiedzający
        </span>
      </div>
    </div>
  )
}
