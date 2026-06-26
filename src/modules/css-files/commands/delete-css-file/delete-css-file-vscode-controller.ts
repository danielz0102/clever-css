import * as vscode from "vscode"

import type { ClassTreeDataProvider } from "../../../../ui/providers/class-tree/class-tree-data-provider"
import { mapCssFiles } from "../../../../ui/providers/class-tree/css-file-data"
import type { GetAllClasses } from "../../queries/get-all-classes/get-all-classes-query-handler"
import type { DeleteCssFile } from "./delete-css-file-command-handler"

export class DeleteCssFileVsCodeController {
  constructor(
    private deleteFile: DeleteCssFile,
    private getAll: GetAllClasses,
    private tree: ClassTreeDataProvider
  ) {}

  async execute(uri: vscode.Uri): Promise<void> {
    await this.deleteFile.execute(uri.toString())
    this.tree.refresh(mapCssFiles(await this.getAll.execute()))
  }
}
