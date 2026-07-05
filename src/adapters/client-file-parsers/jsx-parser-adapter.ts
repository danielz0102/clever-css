import {
  Project,
  SyntaxKind,
  type JsxAttribute,
  type SourceFile,
  type TemplateExpression,
} from "ts-morph"

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
    return jsxAttributes.flatMap((attr) => {
      if (attr.getNameNode().getText() !== "className") return []

      const initializer = attr.getInitializer()
      if (!initializer) return []

      return this.parseInitializer(initializer)
    })
  }

  private parseInitializer(
    initializer: Exclude<ReturnType<JsxAttribute["getInitializer"]>, undefined>
  ): Token[] {
    if (initializer.isKind(SyntaxKind.StringLiteral)) {
      return this.parseText(initializer.getLiteralValue(), initializer.getStart())
    }

    if (!initializer.isKind(SyntaxKind.JsxExpression)) return []

    const expression = initializer.getExpression()
    if (!expression) return []

    if (expression.isKind(SyntaxKind.NoSubstitutionTemplateLiteral)) {
      return this.parseText(expression.getLiteralValue(), expression.getStart())
    }

    if (expression.isKind(SyntaxKind.TemplateExpression)) {
      return this.parseTemplateExpression(expression)
    }

    return []
  }

  private parseText(text: string, startOffset: number): Token[] {
    const usages: Token[] = []

    for (const match of text.matchAll(/\S+/g)) {
      const name = match[0]
      const start = startOffset + match.index + 1

      usages.push({
        name: name,
        location: {
          uri: this.sourceFile.getFilePath(),
          start: this.posAt(start),
          end: this.posAt(start + name.length),
        },
      })
    }

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
