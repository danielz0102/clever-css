import type { ClientFileParser } from "../../adapters/client-file-parsers/client-file-parser-port"
import { HtmlParser } from "../../adapters/client-file-parsers/html-parser-adapter"
import { JsxParser } from "../../adapters/client-file-parsers/jsx-parser-adapter"

export type ParserTestContext = {
  parserName: string
  extension: string
  classNameAttribute: "class" | "className"
  createParser: () => ClientFileParser
}

export const jsxParserContext: ParserTestContext = {
  parserName: "JsxParser",
  extension: "tsx",
  classNameAttribute: "className",
  createParser: () => new JsxParser(),
}

export const htmlParserContext: ParserTestContext = {
  parserName: "HtmlParser",
  extension: "html",
  classNameAttribute: "class",
  createParser: () => new HtmlParser(),
}
