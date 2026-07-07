import { readFileSync } from "node:fs"

import { parse, type DefaultTreeAdapterMap } from "parse5"

import type { Position } from "../../domain/location"
import type { Token } from "../../dtos/token-dto"
import type { ClientFileParser } from "./client-file-parser-port"

type ElementNode = DefaultTreeAdapterMap["element"]
type ChildNode = DefaultTreeAdapterMap["childNode"]

export class HtmlParser implements ClientFileParser {
  parseUsagesFrom(uri: string): Token[] {
    const content = readFileSync(uri, "utf-8")
    const document = parse(content, { sourceCodeLocationInfo: true })
    return this.extractClasses(document, uri, content)
  }

  private extractClasses(
    node: { childNodes?: ChildNode[] },
    uri: string,
    content: string
  ): Token[] {
    const tokens: Token[] = []
    if (!node.childNodes) return tokens

    for (const child of node.childNodes) {
      if ("tagName" in child) {
        const element = child as ElementNode
        const classAttr = element.attrs.find((a) => a.name === "class")
        if (classAttr && element.sourceCodeLocation?.attrs?.["class"]) {
          const attrLocation = element.sourceCodeLocation.attrs["class"]
          tokens.push(...this.parseClassAttribute(classAttr.value, attrLocation, uri, content))
        }
        tokens.push(...this.extractClasses(element, uri, content))
      }
    }
    return tokens
  }

  private parseClassAttribute(
    value: string,
    attrLocation: { startOffset: number; endOffset: number },
    uri: string,
    content: string
  ): Token[] {
    const tokens: Token[] = []

    const attrSource = content.slice(attrLocation.startOffset, attrLocation.endOffset)
    const valueIndexInAttrSource = this.indexOfAttributeValue(attrSource)
    if (valueIndexInAttrSource === -1) return tokens

    const valueStartOffset = attrLocation.startOffset + valueIndexInAttrSource

    for (const match of value.matchAll(/\S+/g)) {
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
