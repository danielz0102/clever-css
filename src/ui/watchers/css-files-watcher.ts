import * as vscode from "vscode"

export function watchCSSFiles({
  onSaveFile,
  onDeleteFile,
}: {
  onSaveFile: (uri: vscode.Uri) => Promise<void>
  onDeleteFile: (uri: vscode.Uri) => Promise<void>
}): vscode.FileSystemWatcher {
  const watcher = vscode.workspace.createFileSystemWatcher("**/*.css")

  watcher.onDidChange(onSaveFile)
  watcher.onDidDelete(onDeleteFile)

  return watcher
}
