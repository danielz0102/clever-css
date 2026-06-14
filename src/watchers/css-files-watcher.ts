import * as vscode from "vscode"

import type { ClassTreeDataProvider } from "../class-tree/class-tree-data-provider"
import { classesToFiles } from "../class-tree/css-file-dto"
import type { CSSClassRepository } from "../domain/css-class-repository"
import { createOrUpdateFile } from "../use-cases/create-or-update-file"

type WatchCSSFilesParams = {
  repo: CSSClassRepository
  provider: ClassTreeDataProvider
}

export function createCSSFilesWatcher({ repo, provider }: WatchCSSFilesParams) {
  const watcher = vscode.workspace.createFileSystemWatcher("**/*.css")

  watcher.onDidChange(async (uri) => {
    await createOrUpdateFile(repo, uri)
    provider.refresh(classesToFiles(repo.getAll()))
  })
  watcher.onDidCreate(async (uri) => {
    await createOrUpdateFile(repo, uri)
    provider.refresh(classesToFiles(repo.getAll()))
  })
  watcher.onDidDelete(async (uri) => {
    repo.deleteFromFile(uri)
    provider.refresh(classesToFiles(repo.getAll()))
  })

  return watcher
}
