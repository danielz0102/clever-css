import * as vscode from "vscode"

import { ClassTreeDataProvider } from "./class-tree/class-tree-data-provider"
import { classesToFiles } from "./class-tree/css-file-dto"
import { openLocation } from "./commands/open-location"
import { findCSSClasses } from "./use-cases/find-css-classes"
import { createCSSFilesWatcher } from "./watchers/css-files-watcher"

export async function activate(context: vscode.ExtensionContext) {
  const classes = await findCSSClasses()
  const classDataProvider = new ClassTreeDataProvider(classesToFiles(classes.getAll()))

  vscode.languages.registerReferenceProvider(
    { pattern: "**/*.css", scheme: "file" },
    {
      provideReferences(document, position) {
        // 1. Get the symbol at the position
        const wordRange = document.getWordRangeAtPosition(position, /\.\w+/)
        if (!wordRange) return

        // 2. If it's not a class, return
        const word = document.getText(wordRange)
        if (!word.startsWith(".")) return

        // 3. Get the class from the repository
        const className = word.substring(1)
        const cssClass = classes.get(className)
        if (!cssClass) return

        // 4. Only if usages are undefined, find usages and set them in the repository
        // It's assumed that usages are updated when files change
        if (!cssClass.usages) {
          return //TODO
        }

        // 5. Merge definitions and usages and return them

        const references = [...cssClass.definitions, ...cssClass.usages]
        return references
      },
    }
  )

  context.subscriptions.push(vscode.commands.registerCommand("css-viewer.openClass", openLocation))
  context.subscriptions.push(vscode.window.registerTreeDataProvider("classes", classDataProvider))
  context.subscriptions.push(createCSSFilesWatcher({ repo: classes, provider: classDataProvider }))
}

export function deactivate() {}
