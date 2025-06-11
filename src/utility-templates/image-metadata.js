/** @type {Utility} */
export const plugin = {
  metadata: {
    name: "Image Metadata",
    version: [1, 0, 0],
    author: "Decryptable",
    description:
      "Extract file, dimension, and EXIF metadata from an image and output as plain text.",
  },
  inputs: [
    {
      type: "image",
      required: true,
      label: "Image File",
      fileTypes: ["image/png"],
      description: "Upload an image to extract metadata",
    },
  ],
  output: "plain",
  buttonLabel: "Extract Metadata",
  requiredModules: [
    new URL("https://cdnjs.cloudflare.com/ajax/libs/exif-js/2.3.0/exif.min.js"),
  ],
};

/**
 * @type {UtilityHandler<typeof plugin>}
 */
export const handler = async (inputs) => {
  const [blob] = inputs;
  if (!(blob instanceof Blob)) throw new Error("Invalid input: not a Blob");

  const file = new File([blob], "image.jpg", { type: blob.type });

  const imageURL = URL.createObjectURL(file);
  const img = new Image();

  const dimensions = await new Promise((resolve, reject) => {
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      reject(new Error("Failed to load image"));
      URL.revokeObjectURL(imageURL);
    };
    img.src = imageURL;
  });

  const exifData = await new Promise((resolve, reject) => {
    try {
      // EXIF needs DOM image, reload
      const img2 = new Image();
      img2.onload = () => {
        try {
          // @ts-ignore
          window.EXIF.getData(img2, function () {
            // @ts-ignore
            const tags = window.EXIF.getAllTags(this);
            console.log(tags);
            resolve(tags);
          });
        } catch (error) {
          reject(new Error(String(error)));
          resolve({});
        }
      };
      img2.src = imageURL;
    } catch {
      resolve({});
    }
  });

  const metadata = {
    Name: file.name,
    Type: file.type,
    Size: `${file.size} bytes`,
    // @ts-ignore
    Width: dimensions.width + " px",
    // @ts-ignore
    Height: dimensions.height + " px",
    ...exifData,
  };

  return Object.entries(metadata)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
};
