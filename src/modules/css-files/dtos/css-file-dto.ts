import * as vscode from "vscode"

export type CSSFileDTO = {
  uri: string
  content: string
}

export const CSSFileDTO = {
  async fromVsCodeUri(uri: vscode.Uri): Promise<CSSFileDTO> {
    const doc = await vscode.workspace.openTextDocument(uri)
    return { uri: uri.toString(), content: doc.getText() }
  },
}
