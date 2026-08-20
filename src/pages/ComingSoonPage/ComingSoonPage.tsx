import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ComingSoonPage({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Ta sekcja nie została jeszcze zaimplementowana.
      </CardContent>
    </Card>
  )
}
