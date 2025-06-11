import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { Play } from "lucide-react"

type Props = {
  plugin: Utility
}

export function UtilityCard({ plugin }: Props) {
  const navigate = useNavigate()
  const { name, author, version, description } = plugin.metadata

  const versionStr = version.join(".")

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 hover:cursor-default">
      <CardContent className="p-4 space-y-2">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">{name}</h2>
          <span className="text-xs text-muted-foreground">v{versionStr}</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {description ?? "No description provided."}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            author: {author}
          </span>
          <Button
            size="icon"
            className="hover:cursor-pointer"
            onClick={() => navigate(`/utility/${name.toLowerCase()}`)}
          >
            <Play/>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
