import * as vscode from "vscode"

import type { CssClassRecord } from "../../persistence/class-index"

type CSSClass = {
  name: string
  range: vscode.Range
}

export type CSSFile = {
  uri: vscode.Uri
  classes: CSSClass[]
}

export type FilesIndex = Map<string, CSSFile>

export function mapCSSFiles(records: CssClassRecord[]): FilesIndex {
  const files: FilesIndex = new Map()

  records.forEach((record) => {
    const definition = record.definitions[0]

    if (!definition) {
      throw new Error(`CSS class ${record.className} has no definition`)
    }

    const uri = vscode.Uri.parse(definition.uri)
    const key = uri.toString()

    let file = files.get(key)

    if (!file) {
      file = { uri, classes: [] }
      files.set(key, file)
    }

    file.classes.push({
      name: record.className,
      range: new vscode.Range(
        definition.start.line,
        definition.start.column,
        definition.end.line,
        definition.end.column
      ),
    })
  })

  return files
}
