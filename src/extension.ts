import * as vscode from "vscode"

import { ClassTreeDataProvider } from "./modules/class-tree/class-tree-data-provider"
import { CSSFileMapper } from "./modules/class-tree/css-file-dto"
import { findCSSClasses } from "./modules/find-classes/find-css-classes"
import { createFindReferencesProvider } from "./modules/find-references/references-provider"
import { openLocation } from "./modules/open-location/open-location"
import { createCSSFilesWatcher } from "./modules/watch-css-files/css-files-watcher"

export async function activate(context: vscode.ExtensionContext) {
  const classes = await findCSSClasses()
  const classDataProvider = new ClassTreeDataProvider(CSSFileMapper.fromEntities(classes.getAll()))

  context.subscriptions.push(vscode.commands.registerCommand("css-viewer.openClass", openLocation))
  context.subscriptions.push(vscode.window.registerTreeDataProvider("classes", classDataProvider))
  context.subscriptions.push(createCSSFilesWatcher({ repo: classes, provider: classDataProvider }))
  context.subscriptions.push(createFindReferencesProvider(classes))
}

export function deactivate() {}
