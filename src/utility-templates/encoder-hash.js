/** @type {Utility} */
export const plugin = {
  metadata: {
    name: "Encode & Hash",
    version: [1, 1, 0],
    author: "Decryptable",
    description:
      "Apply encoding or hashing methods from CryptoJS (e.g., Base64, MD5, SHA-1, HMAC, AES, etc.)",
  },
  inputs: [
    {
      type: "plain",
      required: true,
      label: "Text",
      description: "Text to encode, encrypt, or hash",
    },
    {
      type: "plain",
      required: false,
      label: "Secret Key",
    },
    {
      type: "multi-select",
      required: true,
      label: "Methods",
      description: "Select one or more CryptoJS methods to apply",
      options: [
        { label: "Base64 Encode", value: "base64" },
        { label: "MD5 Hash", value: "md5" },
        { label: "SHA-1 Hash", value: "sha1" },
        { label: "SHA-256 Hash", value: "sha256" },
        { label: "SHA-512 Hash", value: "sha512" },
        { label: "RIPEMD160 Hash", value: "ripemd160" },
        { label: "HMAC-SHA1", value: "hmac-sha1" },
        { label: "HMAC-SHA256", value: "hmac-sha256" },
        { label: "HMAC-SHA512", value: "hmac-sha512" },
        { label: "AES Encrypt", value: "aes" },
        { label: "DES Encrypt", value: "des" },
        { label: "TripleDES Encrypt", value: "tripledes" },
        { label: "Rabbit Encrypt", value: "rabbit" },
        { label: "RC4 Encrypt", value: "rc4" },
      ],
    },
  ],
  output: "plain",
  buttonLabel: "Run",
  requiredModules: [
    new URL(
      "https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js"
    ),
  ],
};

/**
 * @type {UtilityHandler<typeof plugin>}
 */
export const handler = async ([text, key, methods]) => {
  if (typeof text !== "string") throw new Error("Invalid input text");
  if (!Array.isArray(methods)) throw new Error("Invalid method selection");

  const results = [];

  for (const method of methods) {
    let result = "";
    // @ts-ignore
    const parsedText = CryptoJS.enc.Utf8.parse(text);

    try {
      switch (method) {
        case "base64":
          // @ts-ignore
          result = CryptoJS.enc.Base64.stringify(parsedText);
          break;
        case "md5":
          // @ts-ignore
          result = CryptoJS.MD5(text).toString();
          break;
        case "sha1":
          // @ts-ignore
          result = CryptoJS.SHA1(text).toString();
          break;
        case "sha256":
          // @ts-ignore
          result = CryptoJS.SHA256(text).toString();
          break;
        case "sha512":
          // @ts-ignore
          result = CryptoJS.SHA512(text).toString();
          break;
        case "ripemd160":
          // @ts-ignore
          result = CryptoJS.RIPEMD160(text).toString();
          break;
        case "hmac-sha1":
          if (!key) throw new Error("Secret key required for HMAC SHA-1");

          // @ts-ignore
          result = CryptoJS.HmacSHA1(text, key).toString();
          break;
        case "hmac-sha256":
          if (!key) throw new Error("Secret key required for HMAC SHA-256");

          // @ts-ignore
          result = CryptoJS.HmacSHA256(text, key).toString();
          break;
        case "hmac-sha512":
          if (!key) throw new Error("Secret key required for HMAC SHA-512");

          // @ts-ignore
          result = CryptoJS.HmacSHA512(text, key).toString();
          break;
        case "aes":
          if (!key) throw new Error("Secret key required for AES");

          // @ts-ignore
          result = CryptoJS.AES.encrypt(text, key).toString();
          break;
        case "des":
          if (!key) throw new Error("Secret key required for DES");

          // @ts-ignore
          result = CryptoJS.DES.encrypt(text, key).toString();
          break;
        case "tripledes":
          if (!key) throw new Error("Secret key required for TripleDES");

          // @ts-ignore
          result = CryptoJS.TripleDES.encrypt(text, key).toString();
          break;
        case "rabbit":
          if (!key) throw new Error("Secret key required for Rabbit");

          // @ts-ignore
          result = CryptoJS.Rabbit.encrypt(text, key).toString();
          break;
        case "rc4":
          if (!key) throw new Error("Secret key required for RC4");

          // @ts-ignore
          result = CryptoJS.RC4.encrypt(text, key).toString();
          break;
        default:
          result = `Unknown method: ${method}`;
      }

      results.push(`${method}: ${result}`);
    } catch (err) {
      // @ts-ignore
      throw new Error(err.message);
    }
  }

  return results.join("\n\n");
};
