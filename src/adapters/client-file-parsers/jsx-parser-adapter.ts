import { Project, SyntaxKind, type SourceFile, type TemplateExpression } from "ts-morph"

import type { Position } from "../../domain/location"
import type { Token } from "../../dtos/token-dto"
import type { ClientFileParser } from "./client-file-parser-port"

export class JsxParser implements ClientFileParser {
  private readonly project = new Project()

  parseUsagesFrom(uri: string): Token[] {
    this.removeCache(uri)
    const sourceFile = this.project.addSourceFileAtPath(uri)
    return new JsxFileParser(sourceFile).parse()
  }

  private removeCache(uri: string): void {
    const existing = this.project.getSourceFile(uri)
    if (existing) {
      this.project.removeSourceFile(existing)
    }
  }
}

class JsxFileParser {
  constructor(private readonly sourceFile: SourceFile) {}

  parse(): Token[] {
    const jsxAttributes = this.sourceFile.getDescendantsOfKind(SyntaxKind.JsxAttribute)
    const usages: Token[] = []

    jsxAttributes.forEach((attr) => {
      if (attr.getNameNode().getText() !== "className") return

      const initializer = attr.getInitializer()
      if (!initializer) return

      if (initializer.isKind(SyntaxKind.StringLiteral)) {
        usages.push(...this.parseText(initializer.getLiteralValue(), initializer.getStart()))
      } else if (initializer.isKind(SyntaxKind.JsxExpression)) {
        const expression = initializer.getExpression()
        if (!expression) return

        if (expression.isKind(SyntaxKind.NoSubstitutionTemplateLiteral)) {
          usages.push(...this.parseText(expression.getLiteralValue(), expression.getStart()))
        } else if (expression.isKind(SyntaxKind.TemplateExpression)) {
          usages.push(...this.parseTemplateExpression(expression))
        }
      }
    })

    return usages
  }

  private parseText(text: string, startOffset: number): Token[] {
    const names = text.split(/\s+/).filter((name) => name.length > 0)
    let offset = 0

    const usages: Token[] = []

    names.forEach((name) => {
      const idx = text.indexOf(name, offset)
      const start = startOffset + idx + 1
      const end = start + name.length

      usages.push({
        name: name,
        location: {
          uri: this.sourceFile.getFilePath(),
          start: this.posAt(start),
          end: this.posAt(end),
        },
      })
      offset = idx + name.length
    })

    return usages
  }

  private parseTemplateExpression(expression: TemplateExpression): Token[] {
    const head = expression.getHead()
    const usages = this.parseText(head.getLiteralText(), head.getStart())

    expression.getTemplateSpans().forEach((span) => {
      const literal = span.getLiteral()
      usages.push(...this.parseText(literal.getLiteralText(), literal.getStart()))
    })

    return usages
  }

  private posAt(offset: number): Position {
    const { line, column } = this.sourceFile.getLineAndColumnAtPos(offset)
    return { line: line - 1, column: column - 1 }
  }
}
