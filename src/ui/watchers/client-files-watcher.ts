import * as vscode from "vscode"

import type { DeleteUsages } from "../../features/delete-usages/delete-usages-command-handler"
import type { UpdateUsages } from "../../features/update-usages/update-usages-command-handler"

export function watchClientFiles({
  updateUsages,
  deleteUsages,
}: {
  updateUsages: UpdateUsages
  deleteUsages: DeleteUsages
}): vscode.FileSystemWatcher {
  const watcher = vscode.workspace.createFileSystemWatcher("**/*.{ts,tsx,js,jsx}")

  watcher.onDidChange((uri) => updateUsages.execute(uri.fsPath))
  watcher.onDidDelete((uri) => deleteUsages.execute(uri.fsPath))

  return watcher
}
