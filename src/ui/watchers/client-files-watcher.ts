import * as vscode from "vscode"

import type { DeleteUsages } from "../../features/delete-usages/delete-usages-command-handler"
import type { UpdateUsages } from "../../features/update-usages/update-usages-command-handler"
import { CLIENT_FILES_GLOB_PATTERN } from "../../shared/glob-patterns"

export function watchClientFiles({
  updateUsages,
  deleteUsages,
}: {
  updateUsages: UpdateUsages
  deleteUsages: DeleteUsages
}): vscode.FileSystemWatcher {
  const watcher = vscode.workspace.createFileSystemWatcher(CLIENT_FILES_GLOB_PATTERN)

  watcher.onDidChange((uri) => updateUsages.from(uri.fsPath))
  watcher.onDidDelete((uri) => deleteUsages.from(uri.fsPath))

  return watcher
}
