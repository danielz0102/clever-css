import * as vscode from "vscode"

import { ClassTreeDataProvider } from "./class-tree/class-tree-data-provider"
import { fromDomain } from "./class-tree/css-file-dto"
import { openLocation } from "./commands/open-location"
import { findCSSClasses } from "./use-cases/find-css-classes"
import { findUsages } from "./use-cases/find-usages"
import { createCSSFilesWatcher } from "./watchers/css-files-watcher"

export async function activate(context: vscode.ExtensionContext) {
  const classes = await findCSSClasses()
  const classDataProvider = new ClassTreeDataProvider(fromDomain(classes.getAll()))

  vscode.languages.registerReferenceProvider(
    { pattern: "**/*.css", scheme: "file" },
    {
      async provideReferences(document, position) {
        const wordRange = document.getWordRangeAtPosition(position)
        if (!wordRange) return

        const word = document.getText(wordRange)

        const className = word.substring(1)
        const cssClass = classes.get(className)
        if (!cssClass) return

        if (!cssClass.usagesAreLoaded) {
          const usages = await findUsages(className)
          usages.forEach((u) => cssClass.addUsage(u))
          return cssClass.usages as vscode.Location[]
        }

        return cssClass.usages as vscode.Location[]
      },
    }
  )

  context.subscriptions.push(vscode.commands.registerCommand("css-viewer.openClass", openLocation))
  context.subscriptions.push(vscode.window.registerTreeDataProvider("classes", classDataProvider))
  context.subscriptions.push(createCSSFilesWatcher({ repo: classes, provider: classDataProvider }))
}

export function deactivate() {}
