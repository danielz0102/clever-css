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
    const classRegex = new RegExp(`(?:className)=["'][^"']*\\b(${className})\\b[^"']*["']`, "g")
    const locations: vscode.Location[] = []

    const readFile = async (uri: vscode.Uri) => {
      const document = await vscode.workspace.openTextDocument(uri)
      const text = document.getText()

      for (const match of text.matchAll(classRegex)) {
        const [fullMatch, matchedName] = match

        if (!matchedName) {
          throw new Error("Capturing group for class name was not found")
        }

        const nameIndex = match.index + fullMatch.indexOf(matchedName)
        const start = document.positionAt(nameIndex)
        const end = document.positionAt(nameIndex + matchedName.length)
        locations.push(new vscode.Location(uri, new vscode.Range(start, end)))
      }
    }

    await Promise.all(files.map(readFile))

    return locations
  }
}
