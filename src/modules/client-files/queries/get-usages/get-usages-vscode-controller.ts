import * as vscode from "vscode"

import { GetUsages } from "./get-usages-query-handler"

export class GetUsagesVsCodeController {
  constructor(private getUsages: GetUsages) {}

  async execute(className: string): Promise<vscode.Location[]> {
    const usages = await this.getUsages.execute(className)
    return usages.map(
      (l) =>
        new vscode.Location(
          vscode.Uri.file(l.uri),
          new vscode.Range(l.start.line, l.start.column, l.end.line, l.end.column)
        )
    )
  }
}
