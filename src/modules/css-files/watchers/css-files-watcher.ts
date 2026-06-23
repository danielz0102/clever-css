import * as vscode from "vscode"

import type { CSSClass } from "../../../domain/css-class"
import type { CSSClassRepository } from "../../../domain/css-class-repository"
import { SaveCSSFile } from "../commands/save-css-file"

type WatchCSSFilesParams = {
  repo: CSSClassRepository
  onClassesChanged: (classes: CSSClass[]) => void
}

export function createCSSFilesWatcher({ repo, onClassesChanged }: WatchCSSFilesParams) {
  const saveCSSFile = new SaveCSSFile(repo)
  const watcher = vscode.workspace.createFileSystemWatcher("**/*.css")

  watcher.onDidChange(async (uri) => {
    await saveCSSFile.execute(uri)
    onClassesChanged(repo.getAll())
  })
  watcher.onDidDelete(async (uri) => {
    repo.deleteFromFile(uri)
    onClassesChanged(repo.getAll())
  })

  return watcher
}
