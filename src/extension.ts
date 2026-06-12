import * as vscode from "vscode"

import { ClassDataProvider, type CSSFile } from "./class-data-provider"
import { openLocation } from "./commands/open-location"
import { findCSSClasses } from "./find-css-classes"

export async function activate(context: vscode.ExtensionContext) {
  const classes = await findCSSClasses()
  const files: CSSFile[] = []

  for (const c of classes.getAll()) {
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

  const classDataProvider = new ClassDataProvider(files)
  const watcher = vscode.workspace.createFileSystemWatcher("**/*.css")

  //TODO: Update repository
  watcher.onDidChange(() => classDataProvider.refresh())
  watcher.onDidCreate(() => classDataProvider.refresh())
  watcher.onDidDelete(() => classDataProvider.refresh())

  context.subscriptions.push(vscode.commands.registerCommand("css-viewer.openClass", openLocation))
  context.subscriptions.push(vscode.window.registerTreeDataProvider("classes", classDataProvider))
  context.subscriptions.push(watcher)
}

export function deactivate() {}
