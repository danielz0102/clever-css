import type { ClientFileParser } from "./client-file-parser-port"
import { HtmlParser } from "./html-parser-adapter"
import { JsxParser } from "./jsx-parser-adapter"

const parsers: Record<string, ClientFileParser> = {
  jsx: new JsxParser(),
  tsx: new JsxParser(),
  html: new HtmlParser(),
}

export function selectParser(uri: string): ClientFileParser {
  const extension = uri.split(".").pop()
  if (!extension) {
    throw new Error(`File ${uri} has no extension`)
  }

  const parser = parsers[extension]
  if (!parser) {
    throw new Error(`No parser found for extension ${extension}`)
  }
  return parser
}
