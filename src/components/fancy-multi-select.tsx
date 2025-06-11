import { useCallback, useRef, useState } from "react"
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { Command as CommandPrimitive } from "cmdk"

export function FancyMultiSelect({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[]
  value: { label: string; value: string }[]
  onChange: (selected: { label: string; value: string }[]) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")

  const handleUnselect = useCallback(
    (item: (typeof value)[0]) => {
      onChange(value.filter((s) => s.value !== item.value))
    },
    [onChange, value]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current
      if (input) {
        if (
          (e.key === "Delete" || e.key === "Backspace") &&
          input.value === ""
        ) {
          onChange(value.slice(0, -1))
        }
        if (e.key === "Escape") input.blur()
      }
    },
    [onChange, value]
  )

  const selectables = options.filter(
    (opt) => !value.find((v) => v.value === opt.value)
  )

  return (
    <Command
      onKeyDown={handleKeyDown}
      className="overflow-visible bg-transparent"
    >
      <div className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex flex-wrap gap-1">
          {value.map((item) => (
            <Badge key={item.value} variant="secondary">
              {item.label}
              <button
                className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onKeyDown={(e) => e.key === "Enter" && handleUnselect(item)}
                onMouseDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onClick={() => handleUnselect(item)}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </Badge>
          ))}
          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder="Select..."
            className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>
      <div className="relative mt-2">
        <CommandList>
          {open && selectables.length > 0 && (
            <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
              <CommandGroup className="h-full overflow-auto">
                {selectables.map((item) => (
                  <CommandItem
                    key={item.value}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onSelect={() => {
                      setInputValue("")
                      onChange([...value, item])
                    }}
                    className="cursor-pointer"
                  >
                    {item.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </div>
          )}
        </CommandList>
      </div>
    </Command>
  )
}
