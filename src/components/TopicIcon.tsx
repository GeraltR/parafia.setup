import { BookOpen } from "lucide-react"

export function TopicIcon({ iconUrl, className }: { iconUrl: string | null; className?: string }) {
  if (iconUrl) {
    return <img src={iconUrl} alt="" className={className} />
  }

  return <BookOpen className={className} />
}
