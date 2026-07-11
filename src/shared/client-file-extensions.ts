export const CLIENT_FILE_EXTENSIONS = ["tsx", "jsx", "html"] as const

export function toGlobPattern(extensions: readonly string[]): string {
  return `**/*.{${extensions.join(",")}}`
}
