import * as vscode from "vscode"

export function watchCSSFiles(
  saveFile: (uri: vscode.Uri) => Promise<void>,
  deleteFile: (uri: vscode.Uri) => Promise<void>
): vscode.FileSystemWatcher {
  const watcher = vscode.workspace.createFileSystemWatcher("**/*.css")

  watcher.onDidChange(saveFile)
  watcher.onDidDelete(deleteFile)

  return watcher
}
