import * as vscode from "vscode"

import { CSSFileDTO } from "./dtos/css-file-dto"
import type { DeleteCSSFile } from "./use-cases/delete-css-file"
import type { SaveCSSFile } from "./use-cases/save-css-file"

export function watchCSSFiles(
  saveFile: SaveCSSFile,
  deleteFile: DeleteCSSFile
): vscode.FileSystemWatcher {
  const watcher = vscode.workspace.createFileSystemWatcher("**/*.css")

  watcher.onDidChange(async (uri) => {
    await saveFile.execute(await CSSFileDTO.fromVsCodeUri(uri))
  })
  watcher.onDidDelete(async (uri) => {
    await deleteFile.execute(uri.toString())
  })

  return watcher
}
