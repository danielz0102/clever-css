import * as vscode from "vscode"

import type { ClassTreeDataProvider } from "../../../../ui/class-tree/class-tree-data-provider"
import { mapCSSFiles } from "../../../../ui/class-tree/css-file-data"
import { UriMapper } from "../../../../ui/mappers/uri-mapper"
import type { GetAllClasses } from "../../queries/get-all-classes/get-all-classes-query-handler"
import type { SaveCssFile } from "./save-css-file-command-handler"

export class SaveCssFileVsCodeController {
  constructor(
    private saveFile: SaveCssFile,
    private getAll: GetAllClasses,
    private tree: ClassTreeDataProvider
  ) {}

  async execute(uri: vscode.Uri): Promise<void> {
    await this.saveFile.execute(await UriMapper.toCssFileDto(uri))
    this.tree.refresh(mapCSSFiles(await this.getAll.execute()))
  }
}
