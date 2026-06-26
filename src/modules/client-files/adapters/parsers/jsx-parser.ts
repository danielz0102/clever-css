import { Project, SyntaxKind, type TemplateExpression } from "ts-morph"

type Usage = {
  name: string
  start: number
  end: number
}

export class JsxParser {
  private project = new Project()

  getUsagesFrom(path: string): Usage[] {
    const ast = this.project.addSourceFileAtPath(path)
    const jsxAttributes = ast.getDescendantsOfKind(SyntaxKind.JsxAttribute)
    const usages: Usage[] = []

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

  private parseText(text: string, startOffset: number): Usage[] {
    const names = text.split(/\s+/)
    let offset = 0

    const usages: Usage[] = []

    names.forEach((name) => {
      const idx = text.indexOf(name, offset)
      const start = startOffset + idx + 1
      const end = start + name.length

      usages.push({ name, start, end })
      offset = idx + name.length
    })

    return usages
  }

  private parseTemplateExpression(expression: TemplateExpression): Usage[] {
    const usages: Usage[] = []

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
