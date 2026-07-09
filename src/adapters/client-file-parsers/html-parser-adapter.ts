import { readFileSync } from "node:fs"

import * as parse5 from "parse5"

import type { Position } from "../../domain/location"
import type { Token } from "../../dtos/token-dto"
import { toZeroBased } from "../../shared/to-zero-based"
import type { ClientFileParser } from "./client-file-parser-port"

export class HtmlParser implements ClientFileParser {
  parseUsagesFrom(uri: string): Token[] {
    const content = readFileSync(uri, "utf-8")
    return new HtmlAst(content).getClasses().map((u) => ({
      name: u.value,
      location: {
        uri,
        start: u.location.start,
        end: u.location.end,
      },
    }))
  }
}

class HtmlAst {
  private readonly document: parse5.DefaultTreeAdapterTypes.Document

  constructor(private readonly content: string) {
    this.document = parse5.parse(content, { sourceCodeLocationInfo: true })
  }

  getClasses(): ClassValue[] {
    const classes: ClassValue[] = []

    const traverse = (node: parse5.DefaultTreeAdapterTypes.ChildNode) => {
      const attr = this.toClassAttribute(node)
      if (attr) {
        classes.push(...attr.getClasses())
      }

      if ("childNodes" in node) {
        node.childNodes.forEach(traverse)
      }
    }

    this.document.childNodes.forEach(traverse)
    return classes
  }

  private toClassAttribute(
    node: parse5.DefaultTreeAdapterTypes.ChildNode
  ): ClassAttribute | undefined {
    if (!("attrs" in node)) return

    const className = node.attrs.find(({ name }) => name === "class")
    if (!className) return

    const location = node.sourceCodeLocation?.attrs?.[className.name]
    if (!location) {
      throw new Error(`Missing source code location for class attribute: ${className.name}`)
    }

    const source = this.content.slice(location.startOffset, location.endOffset)
    return new ClassAttribute(className.value, location, source)
  }
}

type ClassValue = {
  value: string
  location: {
    start: Position
    end: Position
  }
}

class ClassAttribute {
  constructor(
    private value: string,
    private location: parse5.Token.Location,
    private source: string
  ) {}

  getClasses(): ClassValue[] {
    const start = this.location.startCol + this.source.search(/["']/) + 1

    return Array.from(this.value.matchAll(/\S+/g)).map((match) => {
      const name = match[0]
      const startCol = start + match.index

      return {
        value: name,
        location: {
          start: toZeroBased({
            line: this.location.startLine,
            column: startCol,
          }),
          end: toZeroBased({
            line: this.location.endLine,
            column: startCol + name.length,
          }),
        },
      }
    })
  }
}
