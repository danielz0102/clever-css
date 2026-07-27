import * as vscode from "vscode"

import { parseUsagesFrom } from "./adapters/client-file-parser"
import { CssClassRepository } from "./adapters/css-class-repository"
import { parseCssClassTokens } from "./adapters/css-parser"
import { uriToCssFileDto } from "./dtos/css-file-dto"
import { DeleteDefinitions } from "./features/delete-definitions/delete-definitions-command-handler"
import { DeleteUsages } from "./features/delete-usages/delete-usages-command-handler"
import { Diagnostics } from "./features/diagnostics/diagnostics-service"
import { ClassAnalyzer } from "./features/diagnostics/get-unused-classes-query-handler"
import { GetAllReferences } from "./features/get-all-references/get-all-references-query-handler"
import { createFindReferencesProvider } from "./features/get-all-references/vscode-references-provider-controller"
import { createRenameProvider } from "./features/get-all-references/vscode-rename-provider"
import { GetDefinition } from "./features/get-definition/get-definition-query-handler"
import { createDefinitionProvider } from "./features/get-definition/vscode-definition-provider"
import { createHoverProvider } from "./features/get-definition/vscode-hover-provider"
import { LoadAllUsages } from "./features/load-all-usages/load-all-usages-command-handler"
import { parseAllUsages } from "./features/load-all-usages/parse-all-usages-adapter"
import { LoadDefinitions } from "./features/load-definitions/load-definitions-command-handler"
import { parseAllCssClassSymbols } from "./features/load-definitions/parse-all-symbols"
import { UpdateDefinitions } from "./features/update-definitions/update-definitions-command-handler"
import { UpdateUsages } from "./features/update-usages/update-usages-command-handler"
import { index } from "./persistence/css-class-index"
import { CLIENT_FILE_EXTENSIONS, toGlobPattern } from "./shared/client-file-extensions"
import { ClassTreeViewContainer } from "./ui/class-tree/class-tree-view-container"
import { openLocation } from "./ui/commands/open-location"

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

  const analyzer = new ClassAnalyzer(repo)
  const diagnostics = new Diagnostics(analyzer)
  diagnostics.refresh()

  const trees = ClassTreeViewContainer.create(index)
  const updateDefinitions = new UpdateDefinitions(repo, parseCssClassTokens)
  const deleteDefinitions = new DeleteDefinitions(repo)
  const cssFilesWatcher = vscode.workspace.createFileSystemWatcher("**/*.css")
  cssFilesWatcher.onDidChange(async (uri) => {
    const file = await uriToCssFileDto(uri)
    await updateDefinitions.from(file)
    trees.refresh()
    diagnostics.refresh()
  })
  cssFilesWatcher.onDidDelete(async (uri) => {
    deleteDefinitions.from(uri.fsPath)
    trees.refresh()
    diagnostics.refresh()
  })

  const updateUsages = new UpdateUsages(repo, parseUsagesFrom)
  const deleteUsages = new DeleteUsages(repo)
  const clientFilesWatcher = vscode.workspace.createFileSystemWatcher(
    toGlobPattern(CLIENT_FILE_EXTENSIONS)
  )
  clientFilesWatcher.onDidChange(async (uri) => {
    const file = await uriToCssFileDto(uri)
    updateUsages.from(file)
    diagnostics.refresh()
  })
  clientFilesWatcher.onDidDelete(async (uri) => {
    deleteUsages.from(uri.fsPath)
    diagnostics.refresh()
  })

  const getReferences = new GetAllReferences(index)
  const referenceProvider = createFindReferencesProvider(getReferences)
  const renameProvider = createRenameProvider(getReferences)

  const getDefinition = new GetDefinition(index)
  const hoverProvider = createHoverProvider(getDefinition)
  const definitionProvider = createDefinitionProvider(getDefinition)

  const rescan = async () => {
    await loadDefinitions.execute()
    await loadUsages.execute()
    trees.refresh()
    diagnostics.refresh()
  }

  return [
    vscode.commands.registerCommand("cleverCss.openClass", openLocation),
    vscode.commands.registerCommand("cleverCss.rescan", rescan),
    vscode.window.registerTreeDataProvider("classes", trees.allClassesTree),
    vscode.window.registerTreeDataProvider("unusedClasses", trees.unusedClassesTree),
    cssFilesWatcher,
    clientFilesWatcher,
    referenceProvider,
    renameProvider,
    hoverProvider,
    definitionProvider,
    diagnostics,
  ]
}
