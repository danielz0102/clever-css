import * as vscode from "vscode"

import type { CSSClassRepository } from "../domain/css-class-repository"

type FindReferencesParams = {
  document: vscode.TextDocument
  position: vscode.Position
}

export class FindReferences {
  constructor(private classes: CSSClassRepository) {}

  async execute({
    document,
    position,
  }: FindReferencesParams): Promise<vscode.Location[] | undefined> {
    const wordRange = document.getWordRangeAtPosition(position)
    if (!wordRange) return

    const word = document.getText(wordRange)

    const className = word.substring(1)
    const cssClass = this.classes.get(className)
    if (!cssClass) return

    if (!cssClass.usagesAreLoaded) {
      const usages = await this.findUsages(className)
      usages.forEach((u) => cssClass.addUsage(u))
      return cssClass.usages as vscode.Location[]
    }

    return cssClass.usages as vscode.Location[]
  }

  private async findUsages(className: string): Promise<vscode.Location[]> {
    const files = await vscode.workspace.findFiles("**/*.{jsx,tsx}", "**/node_modules/**")
    const classRegex = new RegExp(`\\b${className}\\b`, "g")
    const locations: vscode.Location[] = []

    const readFile = async (uri: vscode.Uri) => {
      const document = await vscode.workspace.openTextDocument(uri)
      const text = document.getText()

      for (const match of text.matchAll(classRegex)) {
        const start = document.positionAt(match.index)
        const end = document.positionAt(match.index + match[0].length)
        locations.push(new vscode.Location(uri, new vscode.Range(start, end)))
      }
    }

    await Promise.all(files.map(readFile))

    return locations
  }
}
