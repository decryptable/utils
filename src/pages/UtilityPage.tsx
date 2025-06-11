import { useParams } from "react-router-dom"
import { useEffect, useMemo, useState } from "react"
import { loadUtilities, type LoadedUtility } from "@/lib/load-utilities"
import { useForm, Controller } from "react-hook-form"
import { z, ZodType, ZodObject } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCopyToClipboard } from "usehooks-ts"
import { Copy, Check } from "lucide-react"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FancyMultiSelect } from "@/components/fancy-multi-select"
async function loadScript(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${url}"]`)) {
      resolve()
      return
    }

    const script = document.createElement("script")
    script.src = url
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load script: ${url}`))
    document.head.appendChild(script)
  })
}

export default function UtilityPage() {
  const { name } = useParams()
  const [utility, setUtility] = useState<LoadedUtility | null>(null)
  const [output, setOutput] = useState<unknown>(null)
  const [_, copy] = useCopyToClipboard()
  const [justCopied, setJustCopied] = useState(false)
  const [modulesLoaded, setModulesLoaded] = useState(false)
  const [loadingModules, setLoadingModules] = useState(false)
  const [moduleLoadFailed, setModuleLoadFailed] = useState(false)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    loadUtilities().then((all) => {
      const found = all.find(
        (u) => u.plugin.metadata.name.toLowerCase() === name?.toLowerCase()
      )
      if (found) setUtility(found)
    })
  }, [name])

  useEffect(() => {
    const loadModules = async () => {
      if (!utility?.plugin.requiredModules?.length) {
        setModulesLoaded(true)
        return
      }

      setLoadingModules(true)

      try {
        await Promise.all(
          utility.plugin.requiredModules.map((url) =>
            loadScript(url.toString())
          )
        )
        setModulesLoaded(true)
      } catch (error) {
        console.error("Failed to load modules", error)
        toast.error("Failed to load required modules.")

        setModuleLoadFailed(true)
      } finally {
        setLoadingModules(false)
      }
    }

    loadModules()
  }, [utility])

  useEffect(() => {
    if (justCopied) {
      const timeout = setTimeout(() => setJustCopied(false), 1000)
      return () => clearTimeout(timeout)
    }
  }, [justCopied])

  const schema: ZodObject<any> | null = useMemo(() => {
    if (!utility) return null

    const shape: Record<string, ZodType> = {}

    utility.plugin.inputs.forEach((input, i) => {
      let base: ZodType = z.any()

      switch (input.type) {
        case "plain":
          base = z.string()
          break

        case "json":
          base = z.string().refine((val) => {
            try {
              JSON.parse(val)
              return true
            } catch {
              return false
            }
          }, "Invalid JSON")
          break

        case "file":
        case "image":
          base = z
            .instanceof(File)
            .refine((f) => f instanceof File, "File is required")
          break

        case "select":
          base = z
            .string()
            .refine((val) => input.options.some((opt) => opt.value === val), {
              message: "Invalid selection",
            })
          break

        case "multi-select":
          base = z
            .array(
              z
                .string()
                .refine(
                  (val) => input.options.some((opt) => opt.value === val),
                  { message: "Invalid selection" }
                )
            )
            .min(input.required ? 1 : 0)
          break
      }

      shape[`input_${i}`] = input.required ? base : base.optional()
    })

    return z.object(shape)
  }, [utility])

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: schema ? zodResolver(schema) : undefined,
    mode: "onChange",
    defaultValues: useMemo(() => {
      if (!utility) return {}

      return utility.plugin.inputs.reduce((acc, _, i) => {
        acc[`input_${i}`] = (() => {
          const type = utility.plugin.inputs[i].type
          if (type === "file" || type === "image") return null
          if (type === "select")
            return utility.plugin.inputs[i].options?.[0] ?? ""
          return ""
        })()

        return acc
      }, {} as Record<string, any>)
    }, [utility]),
  })

  const onSubmit = async (data: Record<string, any>) => {
    if (!utility || !modulesLoaded || moduleLoadFailed) return

    setOutput(null)
    setIsRunning(true)

    const promise = (async () => {
      const inputs = utility.plugin.inputs.map((input, i) => {
        const val = data[`input_${i}`]
        if (input.type === "json") {
          return JSON.parse(val)
        }
        return val
      })

      const result = await utility.handler(inputs)
      setOutput(result)

      await new Promise((res) => setTimeout(res, 1000))

      return `${plugin.metadata.name} executed successfully`
    })()

    toast.promise(promise, {
      loading: `Running ${plugin.metadata.name}...`,
      success: (msg) => msg,
      error: (err) => `${plugin.metadata.name} Error: ${err.message}`,
      duration: 1000,
    })

    try {
      await promise
    } finally {
      setIsRunning(false)
    }
  }

  const renderInput = (input: Input, index: number) => {
    const name = `input_${index}`

    switch (input.type) {
      case "plain":
        return (
          <Controller
            name={name}
            control={control}
            render={({ field }) => <Input {...field} />}
          />
        )

      case "json":
        return (
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <Textarea {...field} placeholder='{"key": "value"}' />
            )}
          />
        )

      case "file":
      case "image":
        return (
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <Input
                type="file"
                accept={input.fileTypes?.join(",")}
                onChange={(e) => field.onChange(e.target.files?.[0] || null)}
              />
            )}
          />
        )

      case "select":
        return (
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  {input.options?.map((opt, idx) => (
                    <SelectItem key={idx} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        )

      case "multi-select":
        return (
          <Controller
            name={name}
            control={control}
            render={({ field }) => {
              const selected = input.options.filter((opt) =>
                (field.value || []).includes(opt.value)
              )

              return (
                <FancyMultiSelect
                  options={input.options}
                  value={selected}
                  onChange={(newSelected) =>
                    field.onChange(newSelected.map((opt) => opt.value))
                  }
                />
              )
            }}
          />
        )

      default:
        return null
    }
  }

  const renderOutput = () => {
    if (!utility || output == null) return null

    const isCopyable =
      utility.plugin.output === "plain" || utility.plugin.output === "json"

    const textToCopy =
      utility.plugin.output === "json"
        ? JSON.stringify(output, null, 2)
        : String(output)

    const handleCopy = () => {
      toast.success("copied to clipboard", {
        duration: 1000,
      })
      copy(textToCopy)
      setJustCopied(true)
    }

    return (
      <div className="relative space-y-2">
        {/* Header Buttons */}
        {isCopyable && (
          <div className="flex justify-end">
            <Button
              onClick={handleCopy}
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              {justCopied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
        )}

        {/* Main Output */}
        {isCopyable ? (
          <pre className="break-words whitespace-pre-wrap text-muted-foreground p-3 bg-muted rounded-md text-sm overflow-auto">
            {textToCopy}
          </pre>
        ) : utility.plugin.output === "file" ? (
          <div className="flex justify-end">
            <Button
              onClick={() => {
                const url = URL.createObjectURL(output as File)
                const a = document.createElement("a")
                a.href = url
                a.download = (output as File).name || "output.dat"
                a.click()
                URL.revokeObjectURL(url)
              }}
            >
              Download File
            </Button>
          </div>
        ) : utility.plugin.output === "image" ? (
          <img
            src={URL.createObjectURL(output as Blob)}
            alt="Output"
            className="max-w-full max-h-[300px] rounded-md mx-auto"
          />
        ) : null}
      </div>
    )
  }

  if (!utility || loadingModules) {
    return (
      <div className="p-4">
        Loading utility{loadingModules ? " and modules" : ""}...
      </div>
    )
  }

  const { plugin } = utility

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">{plugin.metadata.name}</h1>
      {plugin.metadata.description && (
        <p className="text-muted-foreground">{plugin.metadata.description}</p>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="p-4 space-y-4">
            {plugin.inputs.map((input, i) => (
              <div key={i} className="space-y-1">
                <Label>
                  {input.label} {input.required && "*"}
                </Label>
                {input.description && (
                  <p className="text-sm text-muted-foreground">
                    {input.description}
                  </p>
                )}
                {renderInput(input, i)}
                {errors[`input_${i}`] && (
                  <p className="text-sm text-red-500">
                    {errors[`input_${i}`]?.message?.toString()}
                  </p>
                )}
              </div>
            ))}

            <Button
              type="submit"
              disabled={
                !modulesLoaded || moduleLoadFailed || !isValid || isRunning
              }
            >
              {isRunning ? "Running..." : plugin.buttonLabel || "Run"}
            </Button>
          </CardContent>
        </Card>
      </form>

      {output !== null && (
        <Card className="max-h-96 overflow-hidden">
          {" "}
          {/* batas tinggi card */}
          <CardContent className="p-4 space-y-2 overflow-auto">
            {" "}
            {/* scrollable jika overflow */}
            <h2 className="text-lg font-semibold">Output</h2>
            {renderOutput()}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
