/** @type {Utility} */
export const plugin = {
  metadata: {
    name: "Utility Name",
    version: [1, 0, 0],
    author: "Author Name",
    description: "Utility Description",
  },
  inputs: [
    {
      type: "plain",
      required: true,
      label: "Text",
      description: "Text to hash",
    },
  ],
  output: "plain",
  buttonLabel: "Hash Me",
};

/**
 * @type {UtilityHandler<typeof plugin>}
 */
export const handler = async (_) => {
  return ""
};
