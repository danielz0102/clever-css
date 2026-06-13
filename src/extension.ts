import * as vscode from "vscode"

import { ClassTreeDataProvider } from "./class-tree/class-tree-data-provider"
import { classesToFiles } from "./class-tree/css-file-dto"
import { openLocation } from "./commands/open-location"
import { findCSSClasses, findCSSClassSymbols } from "./find-css-classes"

export async function activate(context: vscode.ExtensionContext) {
  const classes = await findCSSClasses()
  const classDataProvider = new ClassTreeDataProvider(classesToFiles(classes.getAll()))
  const watcher = vscode.workspace.createFileSystemWatcher("**/*.css")

  watcher.onDidChange(async (uri) => {
    classes.deleteFromFile(uri)

    const buffer = await vscode.workspace.fs.readFile(uri)
    const newClasses = await findCSSClassSymbols({ uri, content: buffer.toString() })

    newClasses.forEach((c) => classes.add(c.className, c.location))

    classDataProvider.refresh(classesToFiles(classes.getAll()))
  })
  watcher.onDidCreate(async (uri) => {
    classes.deleteFromFile(uri)

    const buffer = await vscode.workspace.fs.readFile(uri)
    const newClasses = await findCSSClassSymbols({ uri, content: buffer.toString() })

    newClasses.forEach((c) => classes.add(c.className, c.location))

    classDataProvider.refresh(classesToFiles(classes.getAll()))
  })
  watcher.onDidDelete(async (uri) => {
    classes.deleteFromFile(uri)
    classDataProvider.refresh(classesToFiles(classes.getAll()))
  })

  context.subscriptions.push(vscode.commands.registerCommand("css-viewer.openClass", openLocation))
  context.subscriptions.push(vscode.window.registerTreeDataProvider("classes", classDataProvider))
  context.subscriptions.push(watcher)
}

export function deactivate() {}
