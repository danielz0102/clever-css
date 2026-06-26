import * as vscode from "vscode"

import { VSCodeClientFileFinder } from "./modules/client-files/adapters/client-file-finder/vscode-client-file-finder"
import { JsxParser } from "./modules/client-files/adapters/parsers/jsx-parser"
import { DeleteClientFile } from "./modules/client-files/commands/delete-client-file"
import { LoadUsages } from "./modules/client-files/commands/load-usages"
import { SaveClientFile } from "./modules/client-files/commands/save-client-file"
import { parseCssClassSymbols } from "./modules/css-files/adapters/css-parser"
import { DeleteCssFile } from "./modules/css-files/commands/delete-css-file/delete-css-file-command-handler"
import { DeleteCssFileVsCodeController } from "./modules/css-files/commands/delete-css-file/delete-css-file-vscode-controller"
import { findCssFiles } from "./modules/css-files/commands/load-definitions/adapters/find-css-files"
import { LoadDefinitions } from "./modules/css-files/commands/load-definitions/load-definitions-command-handler"
import { SaveCssFile } from "./modules/css-files/commands/save-css-file/save-css-file-command-handler"
import { SaveCssFileVsCodeController } from "./modules/css-files/commands/save-css-file/save-css-file-vscode-controller"
import { GetAllClasses } from "./modules/css-files/queries/get-all-classes/get-all-classes-query-handler"
import { index } from "./persistence/class-index"
import { openLocation } from "./ui/commands/open-location"
import { ClassTreeDataProvider } from "./ui/providers/class-tree/class-tree-data-provider"
import { mapCssFiles } from "./ui/providers/class-tree/css-file-data"
import { createFindReferencesProvider } from "./ui/providers/references-provider"
import { watchClientFiles } from "./ui/watchers/client-files-watcher"
import { watchCSSFiles } from "./ui/watchers/css-files-watcher"

export async function activate(context: vscode.ExtensionContext) {
  const loadDefinitions = new LoadDefinitions(index, findCssFiles, parseCssClassSymbols)
  const getAll = new GetAllClasses(index)

  await loadDefinitions.execute()

  const loadUsages = new LoadUsages(index, new JsxParser(), new VSCodeClientFileFinder())
  void loadUsages.execute()

  const classDataProvider = new ClassTreeDataProvider(mapCssFiles(await getAll.execute()))
  const saveCssFileController = new SaveCssFileVsCodeController(
    new SaveCssFile(index, parseCssClassSymbols),
    getAll,
    classDataProvider
  )
  const deleteCssFileController = new DeleteCssFileVsCodeController(
    new DeleteCssFile(index),
    getAll,
    classDataProvider
  )
  const cssFilesWatcher = watchCSSFiles({
    onSaveFile: async (uri) => saveCssFileController.execute(uri),
    onDeleteFile: async (uri) => deleteCssFileController.execute(uri),
  })

  const saveClientFile = new SaveClientFile(index, new JsxParser())
  const deleteClientFile = new DeleteClientFile(index)
  const clientFilesWatcher = watchClientFiles({
    saveFile: async (uri) => saveClientFile.execute(uri.fsPath),
    deleteFile: async (uri) => deleteClientFile.execute(uri.fsPath),
  })

  context.subscriptions.push(vscode.commands.registerCommand("css-viewer.openClass", openLocation))
  context.subscriptions.push(vscode.window.registerTreeDataProvider("classes", classDataProvider))
  context.subscriptions.push(cssFilesWatcher)
  context.subscriptions.push(clientFilesWatcher)
  context.subscriptions.push(createFindReferencesProvider(index))
}

export function deactivate() {}
