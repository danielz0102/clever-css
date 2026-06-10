import * as vscode from "vscode"

import { ClassDataProvider, type ClassItem } from "./class-data-provider"
import { UsageTreeDataProvider, type Usage } from "./usage-data-provider"

export function activate(context: vscode.ExtensionContext) {
  const openClassCommand = vscode.commands.registerCommand(
    "css-viewer.openClass",
    async (uri: vscode.Uri, range: vscode.Range) => {
      const document = await vscode.workspace.openTextDocument(uri)
      const editor = await vscode.window.showTextDocument(document, { preview: false })
      editor.revealRange(range, vscode.TextEditorRevealType.InCenter)
      editor.selection = new vscode.Selection(range.start, range.start)
    }
  )

  const openUsageCommand = vscode.commands.registerCommand(
    "css-viewer.openUsage",
    async (uri: vscode.Uri, range: vscode.Range) => {
      const document = await vscode.workspace.openTextDocument(uri)
      const editor = await vscode.window.showTextDocument(document, { preview: false })
      editor.revealRange(range, vscode.TextEditorRevealType.InCenter)
      editor.selection = new vscode.Selection(range.start, range.start)
    }
  )

  const usageDataProvider = new UsageTreeDataProvider()

  const findUsagesCommand = vscode.commands.registerCommand(
    "css-viewer.findUsages",
    async (item: ClassItem) => {
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
  )

  const classDataProvider = new ClassDataProvider()
  const watcher = vscode.workspace.createFileSystemWatcher("**/*.css")
  watcher.onDidChange(() => classDataProvider.refresh())
  watcher.onDidCreate(() => classDataProvider.refresh())
  watcher.onDidDelete(() => classDataProvider.refresh())

  context.subscriptions.push(openClassCommand)
  context.subscriptions.push(openUsageCommand)
  context.subscriptions.push(findUsagesCommand)
  context.subscriptions.push(vscode.window.registerTreeDataProvider("classes", classDataProvider))
  context.subscriptions.push(vscode.window.registerTreeDataProvider("usages", usageDataProvider))
  context.subscriptions.push(watcher)
}

export function deactivate() {}
