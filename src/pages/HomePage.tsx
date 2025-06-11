import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { UtilityCard } from "@/components/utility-card"
import { loadUtilities, type LoadedUtility } from "@/lib/load-utilities"
import AnimatedList from "@/components/animated-list"

import { AlignLeft, Code2, FileText, Image as ImageIcon } from "lucide-react"

const categoryIcons: Record<OutputType, JSX.Element> = {
  plain: <AlignLeft className="w-5 h-5 inline-block mr-1" />,
  json: <Code2 className="w-5 h-5 inline-block mr-1" />,
  file: <FileText className="w-5 h-5 inline-block mr-1" />,
  image: <ImageIcon className="w-5 h-5 inline-block mr-1" />,
}

const categoryLabels: Record<OutputType, string> = {
  plain: "Plain Output",
  json: "JSON Output",
  file: "File Output",
  image: "Image Output",
}

export default function HomePage() {
  const [utilities, setUtilities] = useState<LoadedUtility[]>([])
  const [query, setQuery] = useState("")

  useEffect(() => {
    loadUtilities().then(setUtilities)
  }, [])

  const filteredUtilities = useMemo(() => {
    const q = query.toLowerCase()
    return utilities.filter(({ plugin }) => {
      const { name, description, author } = plugin.metadata
      return (
        name.toLowerCase().includes(q) ||
        (description?.toLowerCase().includes(q) ?? false) ||
        author.toLowerCase().includes(q)
      )
    })
  }, [utilities, query])

  const categorized = useMemo(() => {
    const categories: Record<OutputType, LoadedUtility[]> = {
      plain: [],
      json: [],
      file: [],
      image: [],
    }

    for (const util of filteredUtilities) {
      categories[util.plugin.output]?.push(util)
    }

    return categories
  }, [filteredUtilities])

  const hasResults = filteredUtilities.length > 0

  const renderCategory = (type: OutputType) => {
    const items = categorized[type]
    if (items.length === 0) return null

    return (
      <section key={type} className="space-y-2">
        <h2 className="text-xl font-semibold flex items-center">
          {categoryIcons[type]}
          {categoryLabels[type]}
        </h2>
        <AnimatedList
          items={items.map(({ plugin }) => (
            <UtilityCard key={plugin.metadata.name} plugin={plugin} />
          ))}
          maxHeight="max-h-[80vh]"
          className="mx-auto h-full"
          itemClassName="hover:scale-[1.02] transition-transform duration-150"
        />
      </section>
    )
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Utilities</h1>
      <Input
        type="text"
        placeholder="Search utilities..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {hasResults ? (
        <div className="space-y-6">
          {renderCategory("plain")}
          {renderCategory("json")}
          {renderCategory("file")}
          {renderCategory("image")}
        </div>
      ) : (
        <Card>
          <CardContent className="p-4 text-center text-muted-foreground">
            No utilities found for "<strong>{query}</strong>". Try a different
            search term.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
