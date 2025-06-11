export type LoadedUtility<T extends Utility = Utility> = {
    plugin: T
    handler: (inputs: InputValues<T["inputs"]>) => Promise<OutputFor<T["output"]>>
}

/**
 * Validates whether the given plugin conforms to the `Utility` structure.
 */
function isValidUtility(plugin: unknown): plugin is Utility {
    if (typeof plugin !== "object" || plugin === null) return false

    const u = plugin as Utility

    // Check metadata
    if (
        !u.metadata ||
        typeof u.metadata.name !== "string" ||
        !Array.isArray(u.metadata.version) ||
        u.metadata.version.length !== 3 ||
        u.metadata.version.some((v) => typeof v !== "number") ||
        typeof u.metadata.author !== "string"
    ) {
        return false
    }

    // Check output type
    if (!["plain", "json", "file", "image"].includes(u.output)) return false

    // Check inputs
    if (!Array.isArray(u.inputs)) return false

    const validInputTypes = ["plain", "json", "file", "image", "select", "multi-select"]
    for (const input of u.inputs) {
        if (
            !validInputTypes.includes(input.type) ||
            typeof input.required !== "boolean" ||
            typeof input.label !== "string"
        ) {
            return false
        }
    }

    return true
}

/**
 * Dynamically loads and validates all utilities found in the templates folder.
 */
export async function loadUtilities(): Promise<LoadedUtility[]> {
    const modules = import.meta.glob<{
        plugin: Utility
        handler: (inputs: InputValues<Utility["inputs"]>) => Promise<OutputFor<Utility["output"]>>
    }>("@/utility-templates/*.js", { eager: true })

    return Object.entries(modules)
        .filter(([path]) => !path.endsWith("template.js"))
        .map(([, mod]) => {
            if (!mod.plugin || !mod.handler) return null

            const plugin = mod.plugin

            if (!isValidUtility(plugin)) {
                console.warn("[loadUtilities] Skipped invalid plugin:", typeof plugin === "object" && plugin !== null && "metadata" in plugin
                    ? (plugin as Utility).metadata?.name ?? "Unknown"
                    : "Unknown")
                return null
            }

            return {
                plugin,
                handler: mod.handler,
            }
        })
        .filter((u): u is LoadedUtility => u !== null)
}
