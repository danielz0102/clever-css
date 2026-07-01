import * as vscode from "vscode"

import { CssClassIndex } from "./adapters/css-class-index"
import { findClientFiles } from "./modules/client-files/adapters/find-client-files"
import { JsxParser } from "./modules/client-files/adapters/parsers/jsx-parser"
import { DeleteUsages } from "./modules/client-files/commands/delete-usages-command-handler"
import { LoadAllUsages } from "./modules/client-files/commands/load-all-usages-command-handler"
import { UpdateUsages } from "./modules/client-files/commands/update-usages-command-handler"
import { GetUsages } from "./modules/client-files/queries/get-usages/get-usages-query-handler"
import { GetUsagesVsCodeController } from "./modules/client-files/queries/get-usages/get-usages-vscode-controller"
import { parseCssClassSymbols } from "./modules/css-files/adapters/css-parser"
import { DeleteDefinitions } from "./modules/css-files/commands/delete-definitions/delete-definitions-command-handler"
import { DeleteDefinitionsVsCodeController } from "./modules/css-files/commands/delete-definitions/delete-definitions-vscode-controller"
import { findCssFiles } from "./modules/css-files/commands/load-definitions/adapters/find-css-files"
import { LoadDefinitions } from "./modules/css-files/commands/load-definitions/load-definitions-command-handler"
import { UpdateDefinitions } from "./modules/css-files/commands/update-definitions/update-definitions-command-handler"
import { UpdateDefinitionsVsCodeController } from "./modules/css-files/commands/update-definitions/update-definitions-vscode-controller"
import { GetAllClasses } from "./modules/css-files/queries/get-all-classes/get-all-classes-query-handler"
import { index } from "./persistence/class-index"
import { openLocation } from "./ui/commands/open-location"
import { ClassTreeDataProvider } from "./ui/providers/class-tree/class-tree-data-provider"
import { mapCssFiles } from "./ui/providers/class-tree/css-file-data"
import { createFindReferencesProvider } from "./ui/providers/references-provider"
import { watchClientFiles } from "./ui/watchers/client-files-watcher"
import { watchCSSFiles } from "./ui/watchers/css-files-watcher"

export async function activate(context: vscode.ExtensionContext) {
  const repo = new CssClassIndex(index)

  const loadDefinitions = new LoadDefinitions(repo, findCssFiles, parseCssClassSymbols)
  await loadDefinitions.execute()

  const loadUsages = new LoadAllUsages(repo, new JsxParser(), findClientFiles)
  void loadUsages.execute()

  const getAll = new GetAllClasses(index)
  const classDataProvider = new ClassTreeDataProvider(mapCssFiles(await getAll.execute()))
  const saveCssFileController = new UpdateDefinitionsVsCodeController(
    new UpdateDefinitions(repo, parseCssClassSymbols),
    getAll,
    classDataProvider
  )
  const deleteCssFileController = new DeleteDefinitionsVsCodeController(
    new DeleteDefinitions(repo),
    getAll,
    classDataProvider
  )
  const cssFilesWatcher = watchCSSFiles({
    onSaveFile: async (uri) => saveCssFileController.execute(uri),
    onDeleteFile: async (uri) => deleteCssFileController.execute(uri),
  })

  const saveClientFile = new UpdateUsages(repo, new JsxParser())
  const deleteClientFile = new DeleteUsages(repo)
  const clientFilesWatcher = watchClientFiles({
    saveFile: async (uri) => saveClientFile.execute(uri.fsPath),
    deleteFile: async (uri) => deleteClientFile.execute(uri.fsPath),
  })

  const getUsagesController = new GetUsagesVsCodeController(new GetUsages(index))
  const referenceProvider = createFindReferencesProvider((c) => getUsagesController.execute(c))

  context.subscriptions.push(vscode.commands.registerCommand("css-viewer.openClass", openLocation))
  context.subscriptions.push(vscode.window.registerTreeDataProvider("classes", classDataProvider))
  context.subscriptions.push(cssFilesWatcher)
  context.subscriptions.push(clientFilesWatcher)
  context.subscriptions.push(referenceProvider)
}

export function deactivate() {}
