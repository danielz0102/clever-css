import * as vscode from "vscode"

import type { CSSClassRepository } from "../../domain/css-class-repository"
import { DeleteClientFile } from "./use-cases/delete-client-file"
import { SaveClientFile } from "./use-cases/save-client-file"

export function createClientFilesWatcher(repo: CSSClassRepository) {
  const saveClientFile = new SaveClientFile(repo)
  const deleteClientFile = new DeleteClientFile(repo)
  const watcher = vscode.workspace.createFileSystemWatcher("**/*.{jsx,tsx}")

  watcher.onDidChange(async (uri) => {
    await saveClientFile.execute(uri)
  })

  watcher.onDidDelete(async (uri) => {
    await deleteClientFile.execute(uri)
  })

  return watcher
}
