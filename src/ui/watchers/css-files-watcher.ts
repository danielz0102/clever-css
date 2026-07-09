import * as vscode from "vscode"

import { uriToCssFileDto } from "../../dtos/css-file-dto"
import type { DeleteDefinitions } from "../../features/delete-definitions/delete-definitions-command-handler"
import type { GetAllClasses } from "../../features/get-all-classes/get-all-classes-query-handler"
import type { UpdateDefinitions } from "../../features/update-definitions/update-definitions-command-handler"
import type { ClassTreeDataProvider } from "../providers/class-tree/class-tree-data-provider"
import { mapCssFiles } from "../providers/class-tree/css-file-mapper"

type CssFileWatcherDeps = {
  updateDefinitions: UpdateDefinitions
  deleteDefinitions: DeleteDefinitions
  getAll: GetAllClasses
  tree: ClassTreeDataProvider
}

export function watchCSSFiles({
  updateDefinitions,
  deleteDefinitions,
  getAll,
  tree,
}: CssFileWatcherDeps): vscode.FileSystemWatcher {
  const watcher = vscode.workspace.createFileSystemWatcher("**/*.css")

  const refreshTree = async () => {
    tree.refresh(mapCssFiles(await getAll.execute()))
  }

  watcher.onDidChange(async (uri) => {
    await updateDefinitions.from(await uriToCssFileDto(uri))
    await refreshTree()
  })
  watcher.onDidDelete(async (uri) => {
    await deleteDefinitions.from(uri.fsPath)
    await refreshTree()
  })

  return watcher
}
