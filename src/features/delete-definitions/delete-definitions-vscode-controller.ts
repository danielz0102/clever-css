import * as vscode from "vscode"

import type { ClassTreeDataProvider } from "../../ui/providers/class-tree/class-tree-data-provider"
import { mapCssFiles } from "../../ui/providers/class-tree/css-file-data"
import type { GetAllClasses } from "../get-all-classes/get-all-classes-query-handler"
import type { DeleteDefinitions } from "./delete-definitions-command-handler"

export class DeleteDefinitionsVsCodeController {
  constructor(
    private deleteFile: DeleteDefinitions,
    private getAll: GetAllClasses,
    private tree: ClassTreeDataProvider
  ) {}

  async execute(uri: vscode.Uri): Promise<void> {
    await this.deleteFile.execute(uri.toString())
    this.tree.refresh(mapCssFiles(await this.getAll.execute()))
  }
}
