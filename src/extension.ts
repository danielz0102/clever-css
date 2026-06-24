import * as vscode from "vscode"

import { LoadUsages } from "./modules/client-files/use-cases/load-usages"
import { createCSSFilesWatcher } from "./modules/css-files/css-files-watcher"
import { findCSSClasses } from "./modules/css-files/use-cases/find-css-classes"
import { ClassTreeDataProvider } from "./ui/class-tree/class-tree-data-provider"
import { CSSFileMapper } from "./ui/class-tree/css-file-dto"
import { openLocation } from "./ui/open-location"
import { createFindReferencesProvider } from "./ui/references-provider"

export async function activate(context: vscode.ExtensionContext) {
  const classes = await findCSSClasses()
  const loadUsages = new LoadUsages(classes)
  void loadUsages.execute()
  const classDataProvider = new ClassTreeDataProvider(CSSFileMapper.fromEntities(classes.getAll()))

  const cssFilesWatcher = createCSSFilesWatcher(classes)
  cssFilesWatcher.onDidChange(() => {
    classDataProvider.refresh(CSSFileMapper.fromEntities(classes.getAll()))
  })
  cssFilesWatcher.onDidDelete(() => {
    classDataProvider.refresh(CSSFileMapper.fromEntities(classes.getAll()))
  })

  context.subscriptions.push(vscode.commands.registerCommand("css-viewer.openClass", openLocation))
  context.subscriptions.push(vscode.window.registerTreeDataProvider("classes", classDataProvider))
  context.subscriptions.push(cssFilesWatcher)
  context.subscriptions.push(createFindReferencesProvider(classes))
}

export function deactivate() {}
