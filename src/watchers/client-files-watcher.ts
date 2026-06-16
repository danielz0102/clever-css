import * as vscode from "vscode"

import type { CSSClassRepository } from "../domain/css-class-repository"
import { deleteClientFile } from "../use-cases/delete-client-file"
import { saveClientFile } from "../use-cases/save-client-file"

export function createClientFilesWatcher(repo: CSSClassRepository) {
  const watcher = vscode.workspace.createFileSystemWatcher("**/*.{jsx,tsx}")

  watcher.onDidChange(async (uri) => {
    await saveClientFile(repo, uri)
  })

  watcher.onDidDelete(async (uri) => {
    await deleteClientFile(repo, uri)
  })

  return watcher
}
