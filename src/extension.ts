import * as vscode from "vscode"

import { ClassTreeDataProvider } from "./class-tree/class-tree-data-provider"
import { CSSFileMapper } from "./class-tree/css-file-dto"
import { openLocation } from "./commands/open-location"
import { findCSSClasses } from "./use-cases/find-css-classes"
import { FindReferences } from "./use-cases/find-references"
import { createCSSFilesWatcher } from "./watchers/css-files-watcher"

export async function activate(context: vscode.ExtensionContext) {
  const classes = await findCSSClasses()
  const classDataProvider = new ClassTreeDataProvider(CSSFileMapper.fromDomain(classes.getAll()))

  vscode.languages.registerReferenceProvider(
    { pattern: "**/*.css", scheme: "file" },
    {
      async provideReferences(document, position) {
        const findReferences = new FindReferences(classes)
        return await findReferences.execute({ document, position })
      },
    }
  )

  context.subscriptions.push(vscode.commands.registerCommand("css-viewer.openClass", openLocation))
  context.subscriptions.push(vscode.window.registerTreeDataProvider("classes", classDataProvider))
  context.subscriptions.push(createCSSFilesWatcher({ repo: classes, provider: classDataProvider }))
}

export function deactivate() {}
