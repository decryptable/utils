export { }

declare global {
    /**
     * Represents a utility plugin with metadata, input/output types, optional modules, etc.
     */
    type Utility = {
        /** Metadata info for display and sorting */
        metadata: {
            /** Name of the utility */
            name: string
            /** Semantic version as [major, minor, patch] */
            version: [number, number, number]
            /** Author name or handle */
            author: string
            /** Optional short description of the utility */
            description?: string
        }

        /** List of expected input fields */
        inputs: Input[]

        /** Output format produced by the utility */
        output: OutputType

        /** Optional custom label for the run button */
        buttonLabel?: string

        /** Optional external JS modules required for the utility */
        requiredModules?: URL[]
    }

    /**
     * Possible output types a utility can return
     */
    type OutputType = "plain" | "json" | "file" | "image"

    /**
     * Supported input types with UI metadata
     */
    /**
     * Defines a single input field for a utility, including type, label, and validation.
     * Each input has a `type` which determines the expected input data format.
     */
    type Input =
        /**
         * Plain text input (e.g., a single-line or multi-line string).
         */
        | {
            /** Input type: plain text */
            type: "plain"
            /** Whether this input is required before execution */
            required: boolean
            /** Human-readable label to show in the UI */
            label: string
            /** Optional description or helper text shown in the UI */
            description?: string
        }

        /**
         * Structured JSON input. Can be a JSON object or array.
         */
        | {
            /** Input type: JSON object or array */
            type: "json"
            /** Whether this input is required before execution */
            required: boolean
            /** Human-readable label to show in the UI */
            label: string
            /** Optional description or helper text shown in the UI */
            description?: string
        }

        /**
         * File input. Accepts files uploaded by the user.
         */
        | {
            /** Input type: File (any format) */
            type: "file"
            /** Whether this input is required before execution */
            required: boolean
            /** Human-readable label to show in the UI */
            label: string
            /** Optional description or helper text shown in the UI */
            description?: string,
            /** Allowed MIME types, file extensions (e.g., 'image/png', '.pdf') */
            fileTypes?: string[]
        }

        /**
         * Image input. Accepts image files or blobs for processing.
         */
        | {
            /** Input type: Image file (e.g., PNG, JPEG) */
            type: "image"
            /** Whether this input is required before execution */
            required: boolean
            /** Human-readable label to show in the UI */
            label: string
            /** Optional description or helper text shown in the UI */
            description?: string
            /** Allowed image MIME types (e.g., ['image/png', 'image/jpeg']) */
            fileTypes?: string[]
        }
        | {
            /** Input type: single select */
            type: "select"
            /** Whether this input is required before execution */
            required: boolean
            label: string
            /** Optional description or helper text shown in the UI */
            description?: string
            /** List of selectable options */
            options: { label: string; value: string }[]

        }
        | {
            /** Input type: multi select */
            type: "multi-select"
            /** Whether this input is required before execution */
            required: boolean
            label: string
            /** Optional description or helper text shown in the UI */
            description?: string
            /** List of selectable options */
            options: { label: string; value: string }[]
        }

    /**
     * Maps each `OutputType` to its corresponding JavaScript type.
     *
     * Useful for inferring the return type of a utility's handler function based on its declared output type.
     *
     * @example
     * type Result = OutputFor<"plain">; // string
     * type Result = OutputFor<"json">;  // object
     * type Result = OutputFor<"file">;  // File
     * type Result = OutputFor<"image">; // Blob
     */
    type OutputFor<T extends OutputType> =
        T extends "plain" ? string :
        T extends "json" ? object :
        T extends "file" ? File :
        T extends "image" ? Blob :
        never

    /**
    * Maps an `Input["type"]` to the corresponding runtime JavaScript value.
    *
    * This type is used internally to derive the input values passed to the handler
    * from the declared input type in a `Utility`.
    *
    * @example
    * type Val = InputValueFor<"plain">; // string
    * type Val = InputValueFor<"select">; // string
    * type Val = InputValueFor<"multi-select">; // string
    * type Val = InputValueFor<"json">;  // object
    * type Val = InputValueFor<"file">;  // File
    * type Val = InputValueFor<"image">; // Blob
    */
    type InputValueFor<T extends Input["type"]> =
        T extends "plain" ? string :
        T extends "json" ? object :
        T extends "file" ? File :
        T extends "image" ? Blob :
        T extends "select" ? string :
        T extends "multi-select" ? string | string[] :
        never

    /**
     * Maps an array of input definitions to their actual JS value types.
     */
    type InputValues<T extends Input[]> = {
        [K in keyof T]:
        T[K] extends { type: infer U }
        ? U extends Input["type"]
        ? InputValueFor<U>
        : never
        : never
    }

    /**
     * Strongly typed handler based on a `Utility` definition.
     *
     * This helper type infers the input and output types from the `Utility`
     * structure.
     *
     * @example
     * export const handler: UtilityHandler<typeof plugin> = async (inputs) => { ... }
     */
    type UtilityHandler<T extends Utility> = (
        inputs: InputValues<T["inputs"]>
    ) => Promise<OutputFor<T["output"]>>

}
