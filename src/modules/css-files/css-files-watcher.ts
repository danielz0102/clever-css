import * as vscode from "vscode"

import type { DeleteCSSFile } from "./use-cases/delete-css-file"
import type { SaveCSSFile } from "./use-cases/save-css-file"

export function watchCSSFiles(
  saveFile: SaveCSSFile,
  deleteFile: DeleteCSSFile
): vscode.FileSystemWatcher {
  const watcher = vscode.workspace.createFileSystemWatcher("**/*.css")

  watcher.onDidChange(async (uri) => {
    const doc = await vscode.workspace.openTextDocument(uri)
    await saveFile.execute({ uri: uri.toString(), content: doc.getText() })
  })
  watcher.onDidDelete(async (uri) => {
    await deleteFile.execute(uri.toString())
  })

  return watcher
}
