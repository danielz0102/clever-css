import * as vscode from "vscode"

import { LoadUsages } from "./modules/client-files/use-cases/load-usages"
import { watchCSSFiles } from "./modules/css-files/css-files-watcher"
import { DeleteCSSFile } from "./modules/css-files/use-cases/delete-css-file"
import { findCSSClasses } from "./modules/css-files/use-cases/find-css-classes"
import { GetAllClasses } from "./modules/css-files/use-cases/get-all-classes"
import { SaveCSSFile } from "./modules/css-files/use-cases/save-css-file"
import { index } from "./persistence/class-index"
import { ClassTreeDataProvider } from "./ui/class-tree/class-tree-data-provider"
import { CSSFileViewModelMapper } from "./ui/class-tree/css-file-view-model"
import { openLocation } from "./ui/open-location"
import { createFindReferencesProvider } from "./ui/references-provider"

export async function activate(context: vscode.ExtensionContext) {
  const classes = await findCSSClasses()

  const loadUsages = new LoadUsages(classes)
  void loadUsages.execute()

  const getAll = new GetAllClasses(index)
  const classDataProvider = new ClassTreeDataProvider(
    CSSFileViewModelMapper.fromPersistence(await getAll.execute())
  )

  const cssFilesWatcher = watchCSSFiles(new SaveCSSFile(index), new DeleteCSSFile(index))
  cssFilesWatcher.onDidChange(async () => {
    classDataProvider.refresh(CSSFileViewModelMapper.fromPersistence(await getAll.execute()))
  })
  cssFilesWatcher.onDidDelete(async () => {
    classDataProvider.refresh(CSSFileViewModelMapper.fromPersistence(await getAll.execute()))
  })

  context.subscriptions.push(vscode.commands.registerCommand("css-viewer.openClass", openLocation))
  context.subscriptions.push(vscode.window.registerTreeDataProvider("classes", classDataProvider))
  context.subscriptions.push(cssFilesWatcher)
  context.subscriptions.push(createFindReferencesProvider(classes))
}

export function deactivate() {}
