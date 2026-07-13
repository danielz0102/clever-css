import * as vscode from "vscode"

import { selectParser } from "./adapters/client-file-parsers/select-parser"
import { CssClassRepository } from "./adapters/css-class-repository"
import { parseCssClassTokens } from "./adapters/css-parser"
import { DeleteDefinitions } from "./features/delete-definitions/delete-definitions-command-handler"
import { DeleteUsages } from "./features/delete-usages/delete-usages-command-handler"
import { GetAllClasses } from "./features/get-all-classes/get-all-classes-query-handler"
import { GetAllReferences } from "./features/get-all-references/get-all-references-query-handler"
import { createFindReferencesProvider } from "./features/get-all-references/vscode-references-provider-controller"
import { createRenameProvider } from "./features/get-all-references/vscode-rename-provider"
import { LoadAllUsages } from "./features/load-all-usages/load-all-usages-command-handler"
import { parseAllUsages } from "./features/load-all-usages/parse-all-usages-adapter"
import { LoadDefinitions } from "./features/load-definitions/load-definitions-command-handler"
import { parseAllCssClassSymbols } from "./features/load-definitions/parse-all-symbols"
import { UpdateDefinitions } from "./features/update-definitions/update-definitions-command-handler"
import { UpdateUsages } from "./features/update-usages/update-usages-command-handler"
import { index } from "./persistence/css-class-index"
import { ClassTreeDataProvider } from "./ui/class-tree/class-tree-data-provider"
import { modelsToIndex } from "./ui/class-tree/files-index"
import { openLocation } from "./ui/commands/open-location"
import { watchClientFiles } from "./ui/watchers/client-files-watcher"
import { watchCSSFiles } from "./ui/watchers/css-files-watcher"

export async function activate(context: vscode.ExtensionContext) {
  const disposables = await init().catch((err) => {
    console.error("Error during extension activation:", err)
    vscode.window.showErrorMessage("[Clever CSS]: Error during extension activation")
  })

  if (disposables) {
    context.subscriptions.push(...disposables)
  }
}

export function deactivate() {}

async function init(): Promise<vscode.Disposable[]> {
  const repo = new CssClassRepository(index)

  const loadDefinitions = new LoadDefinitions(repo, parseAllCssClassSymbols)
  await loadDefinitions.execute()

  const loadUsages = new LoadAllUsages(repo, parseAllUsages)
  await loadUsages.execute()

  const getAll = new GetAllClasses(index)
  const tree = new ClassTreeDataProvider(modelsToIndex(await getAll.execute()))
  const cssFilesWatcher = watchCSSFiles({
    updateDefinitions: new UpdateDefinitions(repo, parseCssClassTokens),
    deleteDefinitions: new DeleteDefinitions(repo),
    getAll,
    tree,
  })

  const clientFilesWatcher = watchClientFiles({
    updateUsages: new UpdateUsages(repo, {
      parseUsagesFrom: (uri) => selectParser(uri).parseUsagesFrom(uri),
    }),
    deleteUsages: new DeleteUsages(repo),
  })

  const getReferences = new GetAllReferences(index)
  const referenceProvider = createFindReferencesProvider(getReferences)
  const renameProvider = createRenameProvider(getReferences)

  return [
    vscode.commands.registerCommand("cleverCss.openClass", openLocation),
    vscode.window.registerTreeDataProvider("classes", tree),
    cssFilesWatcher,
    clientFilesWatcher,
    referenceProvider,
    renameProvider,
  ]
}
