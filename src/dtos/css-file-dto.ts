import * as vscode from "vscode"

export type CssFileDto = {
  uri: string
  content: string
}

export async function uriToCssFileDto(uri: vscode.Uri): Promise<CssFileDto> {
  const doc = await vscode.workspace.openTextDocument(uri)
  return { uri: uri.fsPath, content: doc.getText() }
}
