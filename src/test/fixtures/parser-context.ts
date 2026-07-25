export type ParserTestContext = {
  suiteName: string
  extension: string
  classNameAttribute: "class" | "className"
}

export const jsxParserContext: ParserTestContext = {
  suiteName: "JsxParser",
  extension: "tsx",
  classNameAttribute: "className",
}

export const htmlParserContext: ParserTestContext = {
  suiteName: "HtmlParser",
  extension: "html",
  classNameAttribute: "class",
}
