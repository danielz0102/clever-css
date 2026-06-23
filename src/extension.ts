import * as vscode from "vscode"

import { initIndex } from "./modules/css-files/commands/init-index/init-index"
import { createCSSFilesWatcher } from "./modules/css-files/watchers/css-files-watcher"
import { ClassTreeDataProvider } from "./ui/class-tree/class-tree-data-provider"
import { CSSFileMapper } from "./ui/class-tree/css-file-dto"
import { openLocation } from "./ui/open-location"
import { createFindReferencesProvider } from "./ui/references-provider"

export async function activate(context: vscode.ExtensionContext) {
  const classes = await initIndex()
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
