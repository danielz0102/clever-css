import * as vscode from "vscode"

export async function findUsages(className: string): Promise<vscode.Location[]> {
  const files = await vscode.workspace.findFiles("**/*.{jsx,tsx}", "**/node_modules/**")
  const classRegex = new RegExp(`\\b${className}\\b`, "g")
  const locations: vscode.Location[] = []

  const readFile = async (uri: vscode.Uri) => {
    const document = await vscode.workspace.openTextDocument(uri)
    const text = document.getText()

    for (const match of text.matchAll(classRegex)) {
      const start = document.positionAt(match.index)
      const end = document.positionAt(match.index + match[0].length)
      locations.push(new vscode.Location(uri, new vscode.Range(start, end)))
    }
  }

  await Promise.all(files.map(readFile))

  return locations
}
