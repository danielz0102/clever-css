import * as vscode from "vscode"

export async function openLocation(uri: vscode.Uri, range: vscode.Range) {
  const document = await vscode.workspace.openTextDocument(uri)
  const editor = await vscode.window.showTextDocument(document, { preview: false })
  editor.revealRange(range, vscode.TextEditorRevealType.InCenter)
  editor.selection = new vscode.Selection(range.start, range.start)
}
