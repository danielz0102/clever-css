import * as vscode from "vscode"

import { ClassTreeDataProvider, type CSSFile } from "./class-tree-data-provider"
import { openLocation } from "./commands/open-location"
import type { CSSClass } from "./domain/css-class"
import { findCSSClasses, findCSSClassSymbols } from "./find-css-classes"

export async function activate(context: vscode.ExtensionContext) {
  const classes = await findCSSClasses()

  const mapFiles = (classes: CSSClass[]): CSSFile[] => {
    const files: CSSFile[] = []

    for (const c of classes) {
      const def = c.firstDefinition
      const file = files.find((f) => f.uri.toString() === def.uri.toString())

      if (file) {
        file.classes.push({
          name: c.name,
          range: def.range,
        })
      } else {
        files.push({
          uri: def.uri,
          classes: [
            {
              name: c.name,
              range: def.range,
            },
          ],
        })
      }
    }

    return files
  }

  const classDataProvider = new ClassTreeDataProvider(mapFiles(classes.getAll()))
  const watcher = vscode.workspace.createFileSystemWatcher("**/*.css")

  watcher.onDidChange(async (uri) => {
    classes.deleteFromFile(uri)

    const buffer = await vscode.workspace.fs.readFile(uri)
    const newClasses = await findCSSClassSymbols({ uri, content: buffer.toString() })

    newClasses.forEach((c) => classes.add(c.className, c.location))

    classDataProvider.refresh(mapFiles(classes.getAll()))
  })
  watcher.onDidCreate(async (uri) => {
    classes.deleteFromFile(uri)

    const buffer = await vscode.workspace.fs.readFile(uri)
    const newClasses = await findCSSClassSymbols({ uri, content: buffer.toString() })

    newClasses.forEach((c) => classes.add(c.className, c.location))

    classDataProvider.refresh(mapFiles(classes.getAll()))
  })
  watcher.onDidDelete(async (uri) => {
    classes.deleteFromFile(uri)
    classDataProvider.refresh(mapFiles(classes.getAll()))
  })

  context.subscriptions.push(vscode.commands.registerCommand("css-viewer.openClass", openLocation))
  context.subscriptions.push(vscode.window.registerTreeDataProvider("classes", classDataProvider))
  context.subscriptions.push(watcher)
}

export function deactivate() {}
