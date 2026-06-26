import * as vscode from "vscode"

import { DeleteCSSFile } from "./modules/css-files/commands/delete-css-file/delete-css-file-command-handler"
import { findCSSFiles } from "./modules/css-files/commands/load-definitions/adapters/find-css-files"
import { LoadDefinitions } from "./modules/css-files/commands/load-definitions/load-definitions-command-handler"
import { SaveCSSFile } from "./modules/css-files/commands/save-css-file/save-css-file-command-handler"
import { GetAllClasses } from "./modules/css-files/queries/get-all-classes/get-all-classes-query-handler"
import { index } from "./persistence/class-index"
import { ClassTreeDataProvider } from "./ui/class-tree/class-tree-data-provider"
import { mapCSSFiles } from "./ui/class-tree/css-file-data"
import { UriMapper } from "./ui/mappers/uri-mapper"
import { openLocation } from "./ui/open-location"
import { createFindReferencesProvider } from "./ui/references-provider"
import { watchCSSFiles } from "./ui/watchers/css-files-watcher"

export async function activate(context: vscode.ExtensionContext) {
  const loadDefinitions = new LoadDefinitions(index, findCSSFiles)
  const saveFile = new SaveCSSFile(index)
  const deleteFile = new DeleteCSSFile(index)
  const getAll = new GetAllClasses(index)

  await loadDefinitions.execute()

  // TODO: Update LoadUsages to use index
  // const loadUsages = new LoadUsages(classes)
  // void loadUsages.execute()

  const classDataProvider = new ClassTreeDataProvider(mapCSSFiles(await getAll.execute()))

  const cssFilesWatcher = watchCSSFiles({
    saveFile: async (uri) => {
      await saveFile.execute(await UriMapper.toCssFileDto(uri))
      classDataProvider.refresh(mapCSSFiles(await getAll.execute()))
    },
    deleteFile: async (uri) => {
      await deleteFile.execute(uri.toString())
      classDataProvider.refresh(mapCSSFiles(await getAll.execute()))
    },
  })

  context.subscriptions.push(vscode.commands.registerCommand("css-viewer.openClass", openLocation))
  context.subscriptions.push(vscode.window.registerTreeDataProvider("classes", classDataProvider))
  context.subscriptions.push(cssFilesWatcher)
  context.subscriptions.push(createFindReferencesProvider(index))
}

export function deactivate() {}
