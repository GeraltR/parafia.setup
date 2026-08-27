import { z } from "zod"

export const topicSchema = z.object({
  iconUrl: z.string().nullable(),
  title: z.string().min(1, "Wymagane"),
  content: z.string(),
  visibleFrom: z.string().nullable(),
  authorId: z.number(),
})

export type TopicFormValues = z.infer<typeof topicSchema>

/** Converts an ISO datetime string to the `YYYY-MM-DDTHH:mm` shape expected by <input type="datetime-local">. */
export function isoToDatetimeLocal(iso: string | null): string {
  if (!iso) {
    return ""
  }
  const date = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function datetimeLocalToIso(value: string): string | null {
  if (!value) {
    return null
  }
  return new Date(value).toISOString()
}
