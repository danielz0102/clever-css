import * as vscode from "vscode"

import { ClassDataProvider } from "./class-data-provider"
import { findUsages, usageDataProvider } from "./commands/find-usages"
import { openLocation } from "./commands/open-location"

export function activate(context: vscode.ExtensionContext) {
  const classDataProvider = new ClassDataProvider()
  const watcher = vscode.workspace.createFileSystemWatcher("**/*.css")
  watcher.onDidChange(() => classDataProvider.refresh())
  watcher.onDidCreate(() => classDataProvider.refresh())
  watcher.onDidDelete(() => classDataProvider.refresh())

  context.subscriptions.push(vscode.commands.registerCommand("css-viewer.openClass", openLocation))
  context.subscriptions.push(vscode.commands.registerCommand("css-viewer.openUsage", openLocation))
  context.subscriptions.push(vscode.commands.registerCommand("css-viewer.findUsages", findUsages))
  context.subscriptions.push(vscode.window.registerTreeDataProvider("classes", classDataProvider))
  context.subscriptions.push(vscode.window.registerTreeDataProvider("usages", usageDataProvider))
  context.subscriptions.push(watcher)
}

export function deactivate() {}
