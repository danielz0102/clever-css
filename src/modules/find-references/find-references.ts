import { Project, SyntaxKind } from "ts-morph"
import * as vscode from "vscode"

import type { CSSClassRepository } from "../../domain/css-class-repository"

export class FindReferences {
  constructor(private classes: CSSClassRepository) {}

  async execute(className: string): Promise<vscode.Location[]> {
    const cssClass = this.classes.get(className)
    if (!cssClass) return []

    if (!cssClass.usagesAreLoaded) {
      const usages = await this.findUsages(className)
      usages.forEach((u) => cssClass.addUsage(u))
      return cssClass.usages as vscode.Location[]
    }

    return cssClass.usages as vscode.Location[]
  }

  private async findUsages(className: string): Promise<vscode.Location[]> {
    const files = await vscode.workspace.findFiles("**/*.{jsx,tsx}", "**/node_modules/**")
    const locations: vscode.Location[] = []

    const readFile = async (uri: vscode.Uri) => {
      const document = await vscode.workspace.openTextDocument(uri)
      const classNames = await this.findClasses(uri.fsPath, className)

      classNames.forEach((c) => {
        const start = document.positionAt(c.start)
        const end = document.positionAt(c.end)
        locations.push(new vscode.Location(uri, new vscode.Range(start, end)))
      })
    }

    await Promise.all(files.map(readFile))

    return locations
  }

  private async findClasses(
    path: string,
    className: string
  ): Promise<{ start: number; end: number }[]> {
    //!: Create just one project and reuse it for all files to improve performance
    const project = new Project()
    const ast = project.addSourceFileAtPath(path)
    const jsxAttributes = ast.getDescendantsOfKind(SyntaxKind.JsxAttribute)
    const classes: { start: number; end: number }[] = []

    jsxAttributes.forEach((attr) => {
      if (attr.getNameNode().getText() !== "className") return

      const initializer = attr.getInitializer()

      if (!initializer) return

      //TODO: check template expressions too
      if (initializer.isKind(SyntaxKind.StringLiteral)) {
        const text = initializer.getLiteralValue()
        const foundClasses = text.split(/\s+/)

        foundClasses.forEach((c) => {
          if (c === className) {
            const start = initializer.getStart() + text.indexOf(c) + 1
            const end = start + c.length
            classes.push({ start, end })
          }
        })
      }
    })

    return classes
  }
}
