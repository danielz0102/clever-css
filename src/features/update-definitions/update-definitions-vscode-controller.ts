import * as vscode from "vscode"

import { uriToCssFileDto } from "../../dtos/css-file-dto"
import type { ClassTreeDataProvider } from "../../ui/providers/class-tree/class-tree-data-provider"
import { mapCssFiles } from "../../ui/providers/class-tree/css-file-data"
import type { GetAllClasses } from "../get-all-classes/get-all-classes-query-handler"
import type { UpdateDefinitions } from "./update-definitions-command-handler"

export class UpdateDefinitionsVsCodeController {
  constructor(
    private saveFile: UpdateDefinitions,
    private getAll: GetAllClasses,
    private tree: ClassTreeDataProvider
  ) {}

  async execute(uri: vscode.Uri): Promise<void> {
    await this.saveFile.execute(await uriToCssFileDto(uri.toString()))
    this.tree.refresh(mapCssFiles(await this.getAll.execute()))
  }
}
