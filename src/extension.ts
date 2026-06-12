import * as vscode from "vscode"

import { ClassDataProvider } from "./class-data-provider"
import { openLocation } from "./commands/open-location"
import { findCSSClasses } from "./find-css-classes"

export async function activate(context: vscode.ExtensionContext) {
  const classes = await findCSSClasses()
  console.log(`Found ${classes.getAll().length} CSS classes.`)
  console.log(
    classes
      .getAll()
      .map((c) => `${c.name}: ${c.definitions.length} definitions, ${c.usages.length} usages`)
      .join("\n")
  )

  const classDataProvider = new ClassDataProvider()
  const watcher = vscode.workspace.createFileSystemWatcher("**/*.css")
  watcher.onDidChange(() => classDataProvider.refresh())
  watcher.onDidCreate(() => classDataProvider.refresh())
  watcher.onDidDelete(() => classDataProvider.refresh())

  context.subscriptions.push(vscode.commands.registerCommand("css-viewer.openClass", openLocation))
  context.subscriptions.push(vscode.window.registerTreeDataProvider("classes", classDataProvider))
  context.subscriptions.push(watcher)
}

export function deactivate() {}
