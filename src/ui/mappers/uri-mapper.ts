import * as vscode from "vscode"

import type { CssFileDto } from "../../modules/css-files/dtos/css-file-dto"

export const UriMapper = {
  async toCssFileDto(uri: vscode.Uri): Promise<CssFileDto> {
    const doc = await vscode.workspace.openTextDocument(uri)
    return { uri: uri.toString(), content: doc.getText() }
  },
}
