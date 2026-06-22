import { Project, SyntaxKind } from "ts-morph"
import * as vscode from "vscode"

import type { CSSClassRepository } from "../../domain/css-class-repository"

type UsagePosition = { start: number; end: number }

export class LoadUsages {
  private project = new Project()

  constructor(private classes: CSSClassRepository) {}

  async execute(): Promise<void> {
    const allClasses = this.classes.getAll()

    await Promise.all(
      allClasses.map(async (cssClass) => {
        const usages = await this.findUsages(cssClass.name)
        usages.forEach((u) => cssClass.addUsage(u))
      })
    )
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

  private async findClasses(path: string, className: string): Promise<UsagePosition[]> {
    const ast = this.project.addSourceFileAtPath(path)
    const jsxAttributes = ast.getDescendantsOfKind(SyntaxKind.JsxAttribute)
    const classes: UsagePosition[] = []

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
