import * as vscode from "vscode"

import type { DeleteCSSFile } from "../commands/delete-css-file/delete-css-file-command-handler"
import type { SaveCSSFile } from "../commands/save-css-file/save-css-file-command-handler"
import { CSSFileDTO } from "../dtos/css-file-dto"

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
