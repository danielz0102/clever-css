import * as vscode from "vscode"

import { UsageTreeDataProvider, type Usage } from "../usage-data-provider"

const usageDataProvider = new UsageTreeDataProvider()

export async function findUsages(item: { cssClassName: string }) {
  const className = item.cssClassName
  const pattern = `(?:class|className)=["']([^"']*\\b${className}\\b[^"']*)["']`
  const regex = new RegExp(pattern)

  const results: Usage[] = []

  const files = await vscode.workspace.findFiles(
    "**/*.{html,jsx,tsx,vue,svelte,astro}",
    "**/node_modules/**"
  )

  for (const file of files) {
    const document = await vscode.workspace.openTextDocument(file)
    const text = document.getText()
    const lines = text.split("\n")

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i] ?? ""
      const match = regex.exec(line)
      if (match) {
        const startIndex = line.indexOf(match[0])
        const start = new vscode.Position(i, startIndex)
        const end = new vscode.Position(i, startIndex + match[0].length)
        results.push({ uri: file, range: new vscode.Range(start, end), text: match[0] })
      }
    }
  }

  if (results.length === 0) {
    vscode.window.showInformationMessage(`No usages of ".${className}" found`)
    return
  }

  usageDataProvider.setUsages(results)
}

export { usageDataProvider }
