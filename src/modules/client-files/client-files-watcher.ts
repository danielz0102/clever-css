import * as vscode from "vscode"

import type { CSSClassRepository } from "../../domain/css-class-repository"
import { JsxParser } from "./adapters/parsers/jsx-parser"
import { DeleteClientFile } from "./commands/delete-client-file"
import { SaveClientFile } from "./commands/save-client-file"

export function createClientFilesWatcher(repo: CSSClassRepository) {
  const saveClientFile = new SaveClientFile(repo, new JsxParser())
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
