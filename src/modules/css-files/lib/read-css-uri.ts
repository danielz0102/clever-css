import * as vscode from "vscode"

import { parseCSSClassSymbols } from "../css-parser"

export async function readCSSFileUri(
  uri: vscode.Uri
): Promise<{ className: string; location: vscode.Location }[]> {
  const doc = await vscode.workspace.openTextDocument(uri)
  const symbols = await parseCSSClassSymbols(doc.getText())

  return symbols.map(({ className, location }) => ({
    className,
    location: new vscode.Location(
      uri,
      new vscode.Position(location.start.line - 1, location.start.column - 1)
    ),
  }))
}
