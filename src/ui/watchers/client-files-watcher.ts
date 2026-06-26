import * as vscode from "vscode"

export function watchClientFiles({
  saveFile,
  deleteFile,
}: {
  saveFile: (uri: vscode.Uri) => Promise<void>
  deleteFile: (uri: vscode.Uri) => Promise<void>
}): vscode.FileSystemWatcher {
  const watcher = vscode.workspace.createFileSystemWatcher("**/*.{ts,tsx,js,jsx}")

  watcher.onDidChange(saveFile)
  watcher.onDidDelete(deleteFile)

  return watcher
}
