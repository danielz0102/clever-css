import * as vscode from "vscode"

import { ClassTreeDataProvider } from "./class-tree/class-tree-data-provider"
import { CSSFileMapper } from "./class-tree/css-file-dto"
import { openLocation } from "./commands/open-location"
import { createFindReferencesProvider } from "./modules/find-references/references-provider"
import { createCSSFilesWatcher } from "./modules/watch-css-files/css-files-watcher"
import { findCSSClasses } from "./use-cases/find-css-classes"

export async function activate(context: vscode.ExtensionContext) {
  const classes = await findCSSClasses()
  const classDataProvider = new ClassTreeDataProvider(CSSFileMapper.fromEntities(classes.getAll()))

  context.subscriptions.push(vscode.commands.registerCommand("css-viewer.openClass", openLocation))
  context.subscriptions.push(vscode.window.registerTreeDataProvider("classes", classDataProvider))
  context.subscriptions.push(createCSSFilesWatcher({ repo: classes, provider: classDataProvider }))
  context.subscriptions.push(createFindReferencesProvider(classes))
}

export function deactivate() {}
