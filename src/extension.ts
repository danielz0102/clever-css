import * as vscode from "vscode"

import { ClassTreeDataProvider } from "./modules/class-tree/class-tree-data-provider"
import { CSSFileMapper } from "./modules/class-tree/css-file-dto"
import { createFindReferencesProvider } from "./modules/find-references/references-provider"
import { findCSSClasses } from "./modules/init-index/find-css-classes"
import { LoadUsages } from "./modules/init-index/load-usages"
import { openLocation } from "./modules/open-location/open-location"
import { createCSSFilesWatcher } from "./modules/watch-css-files/css-files-watcher"

export async function activate(context: vscode.ExtensionContext) {
  const classes = await findCSSClasses()
  const findUsages = new LoadUsages(classes)
  void findUsages.execute()
  const classDataProvider = new ClassTreeDataProvider(CSSFileMapper.fromEntities(classes.getAll()))

  context.subscriptions.push(vscode.commands.registerCommand("css-viewer.openClass", openLocation))
  context.subscriptions.push(vscode.window.registerTreeDataProvider("classes", classDataProvider))
  context.subscriptions.push(
    createCSSFilesWatcher({
      repo: classes,
      onClassesChanged: (newClasses) => {
        classDataProvider.refresh(CSSFileMapper.fromEntities(newClasses))
      },
    })
  )
  context.subscriptions.push(createFindReferencesProvider(classes))
}

export function deactivate() {}
