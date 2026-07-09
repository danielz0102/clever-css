import * as vscode from "vscode"

import { selectParser } from "./adapters/client-file-parsers/select-parser"
import { CssClassRepository } from "./adapters/css-class-repository"
import { parseCssClassTokens } from "./adapters/css-parser"
import { DeleteDefinitions } from "./features/delete-definitions/delete-definitions-command-handler"
import { DeleteUsages } from "./features/delete-usages/delete-usages-command-handler"
import { GetAllClasses } from "./features/get-all-classes/get-all-classes-query-handler"
import { GetAllReferences } from "./features/get-all-references/get-all-references-query-handler"
import { createFindReferencesProvider } from "./features/get-all-references/vscode-references-provider-controller"
import { LoadAllUsages } from "./features/load-all-usages/load-all-usages-command-handler"
import { parseAllUsages } from "./features/load-all-usages/parse-all-usages-adapter"
import { LoadDefinitions } from "./features/load-definitions/load-definitions-command-handler"
import { parseAllCssClassSymbols } from "./features/load-definitions/parse-all-symbols"
import { UpdateDefinitions } from "./features/update-definitions/update-definitions-command-handler"
import { UpdateUsages } from "./features/update-usages/update-usages-command-handler"
import { index } from "./persistence/css-class-index"
import { openLocation } from "./ui/commands/open-location"
import { ClassTreeDataProvider } from "./ui/providers/class-tree/class-tree-data-provider"
import { mapCssFiles } from "./ui/providers/class-tree/css-file-data"
import { watchClientFiles } from "./ui/watchers/client-files-watcher"
import { watchCSSFiles } from "./ui/watchers/css-files-watcher"

export async function activate(context: vscode.ExtensionContext) {
  const repo = new CssClassRepository(index)

  const loadDefinitions = new LoadDefinitions(repo, parseAllCssClassSymbols)
  await loadDefinitions.execute().catch((err) => {
    console.error("Error loading definitions:", err)
    vscode.window.showErrorMessage("[Clever CSS]: Error loading CSS definitions")
  })

  const loadUsages = new LoadAllUsages(repo, parseAllUsages)
  void loadUsages.execute().catch((err) => {
    console.error("Error loading usages:", err)
    vscode.window.showErrorMessage("[Clever CSS]: Error loading CSS usages")
  })

  const getAll = new GetAllClasses(index)
  const tree = new ClassTreeDataProvider(mapCssFiles(await getAll.execute()))
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

  const referenceProvider = createFindReferencesProvider(new GetAllReferences(index))

  context.subscriptions.push(vscode.commands.registerCommand("cleverCss.openClass", openLocation))
  context.subscriptions.push(vscode.window.registerTreeDataProvider("classes", tree))
  context.subscriptions.push(cssFilesWatcher)
  context.subscriptions.push(clientFilesWatcher)
  context.subscriptions.push(referenceProvider)
}

export function deactivate() {}
