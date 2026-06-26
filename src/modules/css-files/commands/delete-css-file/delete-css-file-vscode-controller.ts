import * as vscode from "vscode"

import type { ClassTreeDataProvider } from "../../../../ui/class-tree/class-tree-data-provider"
import { mapCSSFiles } from "../../../../ui/class-tree/css-file-data"
import type { GetAllClasses } from "../../queries/get-all-classes/get-all-classes-query-handler"
import type { DeleteCSSFile } from "./delete-css-file-command-handler"

export class DeleteCssFileVsCodeController {
  constructor(
    private deleteFile: DeleteCSSFile,
    private getAll: GetAllClasses,
    private tree: ClassTreeDataProvider
  ) {}

  async execute(uri: vscode.Uri): Promise<void> {
    await this.deleteFile.execute(uri.toString())
    this.tree.refresh(mapCSSFiles(await this.getAll.execute()))
  }
}
