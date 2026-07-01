import * as vscode from "vscode"

export type CssFileDto = {
  uri: string
  content: string
}

export async function uriToCssFileDto(uri: string): Promise<CssFileDto> {
  const doc = await vscode.workspace.openTextDocument(uri)
  return { uri: uri.toString(), content: doc.getText() }
}
