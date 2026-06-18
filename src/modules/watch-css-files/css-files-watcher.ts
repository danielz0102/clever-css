import * as vscode from "vscode"

import type { CSSClassRepository } from "../../domain/css-class-repository"
import type { ClassTreeDataProvider } from "../class-tree/class-tree-data-provider"
import { CSSFileMapper } from "../class-tree/css-file-dto"
import { SaveCSSFile } from "./save-css-file"

type WatchCSSFilesParams = {
  repo: CSSClassRepository
  provider: ClassTreeDataProvider
}

export function createCSSFilesWatcher({ repo, provider }: WatchCSSFilesParams) {
  const saveCSSFile = new SaveCSSFile(repo)
  const watcher = vscode.workspace.createFileSystemWatcher("**/*.css")

  watcher.onDidChange(async (uri) => {
    await saveCSSFile.execute(uri)
    provider.refresh(CSSFileMapper.fromEntities(repo.getAll()))
  })
  watcher.onDidDelete(async (uri) => {
    repo.deleteFromFile(uri)
    provider.refresh(CSSFileMapper.fromEntities(repo.getAll()))
  })

  return watcher
}
