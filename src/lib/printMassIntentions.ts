import type { MassIntention } from "@/types/config"

const WEEKDAY_FULL_PL = [
  "niedziela",
  "poniedziałek",
  "wtorek",
  "środa",
  "czwartek",
  "piątek",
  "sobota",
]

function formatDatePl(iso: string): string {
  const date = new Date(`${iso}T00:00:00`)
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  return `${day}.${month}.${date.getFullYear()}`
}

function formatDay(iso: string): string {
  const date = new Date(`${iso}T00:00:00`)
  const weekday = WEEKDAY_FULL_PL[date.getDay()]
  return `${weekday}, ${formatDatePl(iso)}`
}

const PRINT_CSS = `
  body { font-family: Georgia, "Times New Roman", serif; color: #1a1a1a; margin: 32px; }
  h1 { font-size: 1.3rem; text-align: center; margin-bottom: 24px; }
  .day { break-inside: avoid; margin-bottom: 18px; }
  .day-header { background: #eee; font-weight: bold; padding: 6px 10px; text-align: center; }
  table { width: 100%; border-collapse: collapse; }
  td { border: 1px solid #999; padding: 6px 10px; vertical-align: top; }
  td.time { width: 70px; font-weight: bold; white-space: nowrap; }
`

export function printMassIntentions(items: MassIntention[], fromIso: string) {
  const fromLabel = fromIso ? formatDatePl(fromIso) : ""
  const groups: { date: string; dayDescription: string | null; rows: MassIntention[] }[] = []
  for (const item of items) {
    const last = groups[groups.length - 1]
    if (last && last.date === item.date) {
      last.rows.push(item)
    } else {
      groups.push({ date: item.date, dayDescription: item.dayDescription, rows: [item] })
    }
  }

  const body = groups
    .map(
      (group) => `
        <div class="day">
          <div class="day-header">${formatDay(group.date)}${group.dayDescription ? ` — ${group.dayDescription}` : ""}</div>
          <table>
            <tbody>
              ${group.rows
                .map(
                  (row) =>
                    `<tr><td class="time">${row.time}</td><td>${row.intention}</td></tr>`
                )
                .join("")}
            </tbody>
          </table>
        </div>
      `
    )
    .join("")

  const iframe = document.createElement("iframe")
  iframe.style.position = "fixed"
  iframe.style.right = "0"
  iframe.style.bottom = "0"
  iframe.style.width = "0"
  iframe.style.height = "0"
  iframe.style.border = "0"
  document.body.appendChild(iframe)

  const doc = iframe.contentWindow?.document
  if (!doc) {
    document.body.removeChild(iframe)
    return
  }

  doc.open()
  doc.write(
    `<!doctype html><html><head><meta charset="utf-8"><style>${PRINT_CSS}</style></head><body><h1>Intencje mszalne od ${fromLabel}</h1>${body}</body></html>`
  )
  doc.close()

  iframe.contentWindow?.focus()
  iframe.contentWindow?.print()

  setTimeout(() => document.body.removeChild(iframe), 1000)
}
