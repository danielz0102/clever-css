import * as vscode from "vscode"

import type { ClassTreeDataProvider } from "../class-tree/class-tree-data-provider"
import { CSSFileMapper } from "../class-tree/css-file-dto"
import type { CSSClassRepository } from "../domain/css-class-repository"
import { saveCSSFile } from "../use-cases/save-css-file"

type WatchCSSFilesParams = {
  repo: CSSClassRepository
  provider: ClassTreeDataProvider
}

export function createCSSFilesWatcher({ repo, provider }: WatchCSSFilesParams) {
  const watcher = vscode.workspace.createFileSystemWatcher("**/*.css")

  watcher.onDidChange(async (uri) => {
    await saveCSSFile(repo, uri)
    provider.refresh(CSSFileMapper.fromDomain(repo.getAll()))
  })
  watcher.onDidDelete(async (uri) => {
    repo.deleteFromFile(uri)
    provider.refresh(CSSFileMapper.fromDomain(repo.getAll()))
  })

  return watcher
}
