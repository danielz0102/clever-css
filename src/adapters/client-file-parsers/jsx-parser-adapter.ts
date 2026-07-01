import { Project, SyntaxKind, type SourceFile, type TemplateExpression } from "ts-morph"

import type { Position } from "../../domain/location"
import type { Symbol } from "../../dtos/symbol-dto"
import type { ClientFileParser } from "./client-file-parser-port"

export class JsxParser implements ClientFileParser {
  private project = new Project()
  private sourceFile?: SourceFile

  getUsagesFrom(uri: string): Symbol[] {
    this.sourceFile = this.project.addSourceFileAtPath(uri)
    const jsxAttributes = this.sourceFile.getDescendantsOfKind(SyntaxKind.JsxAttribute)
    const usages: Symbol[] = []

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

  private posAt(offset: number): Position {
    const { line, column } = this.sourceFile!.getLineAndColumnAtPos(offset)
    return { line: line - 1, column: column - 1 }
  }

  private parseText(text: string, startOffset: number): Symbol[] {
    const names = text.split(/\s+/)
    let offset = 0

    const usages: Symbol[] = []

    names.forEach((name) => {
      const idx = text.indexOf(name, offset)
      const start = startOffset + idx + 1
      const end = start + name.length

      usages.push({
        className: name,
        location: {
          uri: this.sourceFile!.getFilePath(),
          start: this.posAt(start),
          end: this.posAt(end),
        },
      })
      offset = idx + name.length
    })

    return usages
  }

  private parseTemplateExpression(expression: TemplateExpression): Symbol[] {
    const usages: Symbol[] = []

    const head = expression.getHead()
    usages.push(...this.parseText(head.getLiteralText(), head.getStart()))

    expression.getTemplateSpans().forEach((span) => {
      const literal = span.getLiteral()

      if (literal.isKind(SyntaxKind.TemplateMiddle) || literal.isKind(SyntaxKind.TemplateTail)) {
        usages.push(...this.parseText(literal.getLiteralText(), literal.getStart()))
      }
    })

    return usages
  }
}
