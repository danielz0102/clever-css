import * as vscode from "vscode"

import type { CSSClassRepository } from "../domain/css-class-repository"

export async function saveClientFile(classes: CSSClassRepository, uri: vscode.Uri): Promise<void> {
  const classesWithUsage = classes.getAll().filter((c) => c.hasUsage(uri))
  classesWithUsage.forEach((c) => c.removeUsage(uri))

  const document = await vscode.workspace.openTextDocument(uri)
  const text = document.getText()
  const classRegex = /className?=["'`]([^"'`]+)["'`]/g

  for (const match of text.matchAll(classRegex)) {
    const classNames = match[1]?.split(" ").filter(Boolean) ?? []

    classNames.forEach((c) => {
      const cssClass = classes.get(c)

      if (cssClass && cssClass.usagesAreLoaded) {
        const start = document.positionAt(match.index)
        const end = document.positionAt(match.index + match[0].length)
        cssClass.addUsage(new vscode.Location(uri, new vscode.Range(start, end)))
      }
    })
  }
}
