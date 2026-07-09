import type { ClientFileParser } from "../../adapters/client-file-parsers/client-file-parser-port"
import { HtmlParser } from "../../adapters/client-file-parsers/html-parser-adapter"
import { JsxParser } from "../../adapters/client-file-parsers/jsx-parser-adapter"

export abstract class ClientFileParserTextContext {
  constructor(
    readonly parserName: string,
    readonly extension: string,
    readonly classNameAttribute: "class" | "className"
  ) {}

  abstract createParser(): ClientFileParser
}

export class JsxParserTextContext extends ClientFileParserTextContext {
  constructor() {
    super("JsxParser", "tsx", "className")
  }

  createParser(): ClientFileParser {
    return new JsxParser()
  }
}

export class HtmlParserTextContext extends ClientFileParserTextContext {
  constructor() {
    super("HtmlParser", "html", "class")
  }

  createParser(): ClientFileParser {
    return new HtmlParser()
  }
}
