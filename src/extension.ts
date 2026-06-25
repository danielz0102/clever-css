import * as vscode from "vscode"

import { watchCSSFiles } from "./modules/css-files/css-files-watcher"
import { CSSFileDTO } from "./modules/css-files/dtos/css-file-dto"
import { DeleteCSSFile } from "./modules/css-files/use-cases/delete-css-file"
import { GetAllClasses } from "./modules/css-files/use-cases/get-all-classes"
import { LoadDefinitions } from "./modules/css-files/use-cases/load-definitions"
import { SaveCSSFile } from "./modules/css-files/use-cases/save-css-file"
import { index } from "./persistence/class-index"
import { ClassTreeDataProvider } from "./ui/class-tree/class-tree-data-provider"
import { mapCSSFiles } from "./ui/class-tree/css-file-data"
import { openLocation } from "./ui/open-location"
import { createFindReferencesProvider } from "./ui/references-provider"

export async function activate(context: vscode.ExtensionContext) {
  const loadDefinitions = new LoadDefinitions(index)
  const getAll = new GetAllClasses(index)

  await loadDefinitions.execute(await findCSSFiles())

  // TODO: Update LoadUsages to use index
  // const loadUsages = new LoadUsages(classes)
  // void loadUsages.execute()

  const classDataProvider = new ClassTreeDataProvider(mapCSSFiles(await getAll.execute()))

  const cssFilesWatcher = watchCSSFiles(new SaveCSSFile(index), new DeleteCSSFile(index))
  cssFilesWatcher.onDidChange(async () => {
    classDataProvider.refresh(mapCSSFiles(await getAll.execute()))
  })
  cssFilesWatcher.onDidDelete(async () => {
    classDataProvider.refresh(mapCSSFiles(await getAll.execute()))
  })

  context.subscriptions.push(vscode.commands.registerCommand("css-viewer.openClass", openLocation))
  context.subscriptions.push(vscode.window.registerTreeDataProvider("classes", classDataProvider))
  context.subscriptions.push(cssFilesWatcher)
  context.subscriptions.push(createFindReferencesProvider(index))
}

export function deactivate() {}

async function findCSSFiles(): Promise<CSSFileDTO[]> {
  const uris = await vscode.workspace.findFiles("**/*.css", "**/{node_modules,dist,build}/**")
  const files = await Promise.all(uris.map(async (u) => CSSFileDTO.fromVsCodeUri(u)))
  return files
}
