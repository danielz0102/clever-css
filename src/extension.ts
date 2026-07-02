import * as vscode from "vscode"

import { JsxParser } from "./adapters/client-file-parsers/jsx-parser-adapter"
import { CssClassIndex } from "./adapters/css-class-index"
import { parseCssClassTokens } from "./adapters/css-parser"
import { DeleteDefinitions } from "./features/delete-definitions/delete-definitions-command-handler"
import { DeleteDefinitionsVsCodeController } from "./features/delete-definitions/delete-definitions-vscode-controller"
import { DeleteUsages } from "./features/delete-usages/delete-usages-command-handler"
import { GetAllClasses } from "./features/get-all-classes/get-all-classes-query-handler"
import { GetUsages } from "./features/get-usages/get-usages-query-handler"
import { GetUsagesVsCodeController } from "./features/get-usages/get-usages-vscode-controller"
import { parseAllUsages } from "./features/load-all-usages/find-client-files-adapter"
import { LoadAllUsages } from "./features/load-all-usages/load-all-usages-command-handler"
import { LoadDefinitions } from "./features/load-definitions/load-definitions-command-handler"
import { parseAllCssClassSymbols } from "./features/load-definitions/parse-all-symbols"
import { UpdateDefinitions } from "./features/update-definitions/update-definitions-command-handler"
import { UpdateDefinitionsVsCodeController } from "./features/update-definitions/update-definitions-vscode-controller"
import { UpdateUsages } from "./features/update-usages/update-usages-command-handler"
import { index } from "./persistence/index-map"
import { openLocation } from "./ui/commands/open-location"
import { ClassTreeDataProvider } from "./ui/providers/class-tree/class-tree-data-provider"
import { mapCssFiles } from "./ui/providers/class-tree/css-file-data"
import { createFindReferencesProvider } from "./ui/providers/references-provider"
import { watchClientFiles } from "./ui/watchers/client-files-watcher"
import { watchCSSFiles } from "./ui/watchers/css-files-watcher"

export async function activate(context: vscode.ExtensionContext) {
  const repo = new CssClassIndex(index)

  const loadDefinitions = new LoadDefinitions(repo, parseAllCssClassSymbols)
  await loadDefinitions.execute()

  const loadUsages = new LoadAllUsages(repo, parseAllUsages)
  void loadUsages.execute()

  const getAll = new GetAllClasses(index)
  const classDataProvider = new ClassTreeDataProvider(mapCssFiles(await getAll.execute()))
  const saveCssFileController = new UpdateDefinitionsVsCodeController(
    new UpdateDefinitions(repo, parseCssClassTokens),
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
