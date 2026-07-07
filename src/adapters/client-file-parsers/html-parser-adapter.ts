import { readFileSync } from "node:fs"

import * as parse5 from "parse5"

import type { Position } from "../../domain/location"
import type { Token } from "../../dtos/token-dto"
import type { ClientFileParser } from "./client-file-parser-port"

type ChildNode = parse5.DefaultTreeAdapterMap["childNode"]
type Element = parse5.DefaultTreeAdapterMap["element"]
type Template = parse5.DefaultTreeAdapterMap["template"]

type ClassAttributeData = {
  value: string
  location: parse5.Token.Location
}

export class HtmlParser implements ClientFileParser {
  parseUsagesFrom(uri: string): Token[] {
    const content = readFileSync(uri, "utf-8")
    const document = parse5.parse(content, { sourceCodeLocationInfo: true })
    return this.extractClasses(document, uri, content)
  }

  private extractClasses(
    node: { childNodes?: ChildNode[] },
    uri: string,
    content: string
  ): Token[] {
    if (!node.childNodes) return []

    const tokens: Token[] = []

    for (const child of node.childNodes) {
      if (!this.nodeHasAttributes(child)) continue

      const classAttr = this.getAttributeData(child, "class")
      if (classAttr) {
        tokens.push(...this.parseClassAttribute(classAttr, uri, content))
      }

      tokens.push(...this.extractClasses(child, uri, content))
    }

    return tokens
  }

  private nodeHasAttributes(node: ChildNode): node is Element | Template {
    return "attrs" in node
  }

  private getAttributeData(
    node: Element | Template,
    attrName: string
  ): ClassAttributeData | undefined {
    const classAttr = node.attrs.find((a) => a.name === attrName)
    if (!classAttr) return

    const location = node.sourceCodeLocation?.attrs?.[attrName]
    if (!location) return

    return { value: classAttr.value, location }
  }

  private parseClassAttribute(attr: ClassAttributeData, uri: string, content: string): Token[] {
    const tokens: Token[] = []

    const attrSource = content.slice(attr.location.startOffset, attr.location.endOffset)
    const valueIndexInAttrSource = this.indexOfAttributeValue(attrSource)
    if (valueIndexInAttrSource === -1) return tokens

    const valueStartOffset = attr.location.startOffset + valueIndexInAttrSource

    for (const match of attr.value.matchAll(/\S+/g)) {
      const name = match[0]
      const startOffset = valueStartOffset + match.index
      const endOffset = startOffset + name.length
      tokens.push({
        name,
        location: {
          uri,
          start: this.offsetToPosition(content, startOffset),
          end: this.offsetToPosition(content, endOffset),
        },
      })
    }
    return tokens
  }

  private indexOfAttributeValue(attrSource: string): number {
    const eqIndex = attrSource.indexOf("=")
    if (eqIndex === -1) return -1
    let pos = eqIndex + 1
    while (pos < attrSource.length && attrSource[pos] === " ") pos++
    if (pos < attrSource.length && (attrSource[pos] === '"' || attrSource[pos] === "'")) {
      pos++
    }
    return pos
  }

  private offsetToPosition(content: string, offset: number): Position {
    const before = content.slice(0, offset)
    const lastNewline = before.lastIndexOf("\n")
    return {
      line: before.split("\n").length - 1,
      column: offset - lastNewline - 1,
    }
  }
}
