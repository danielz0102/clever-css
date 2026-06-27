import * as vscode from "vscode"

export function createFindReferencesProvider(
  getReferences: (className: string) => vscode.ProviderResult<vscode.Location[]>
) {
  return vscode.languages.registerReferenceProvider(
    { pattern: "**/*.css", scheme: "file" },
    {
      async provideReferences(document, position) {
        const wordRange = document.getWordRangeAtPosition(position)

        if (!wordRange) return

        return getReferences(document.getText(wordRange).substring(1))
      },
    }
  )
}
