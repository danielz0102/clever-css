import * as vscode from "vscode"

import type { CSSClassRepository } from "../../domain/css-class-repository"
import { SaveCSSFile } from "./use-cases/save-css-file"

export function createCSSFilesWatcher(repo: CSSClassRepository) {
  const saveCSSFile = new SaveCSSFile(repo)
  const watcher = vscode.workspace.createFileSystemWatcher("**/*.css")

  watcher.onDidChange(async (uri) => {
    await saveCSSFile.execute(uri)
  })
  watcher.onDidDelete(async (uri) => {
    repo.deleteFromFile(uri)
  })

  return watcher
}
