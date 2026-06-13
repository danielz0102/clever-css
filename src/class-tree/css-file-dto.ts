import type * as vscode from "vscode"

import type { CSSClass } from "../domain/css-class"

export type CSSFile = {
  uri: vscode.Uri
  classes: Array<{
    name: string
    range: vscode.Range
  }>
}

export function classesToFiles(classes: CSSClass[]): CSSFile[] {
  const files: CSSFile[] = []

  for (const c of classes) {
    const def = c.firstDefinition
    const file = files.find((f) => f.uri.toString() === def.uri.toString())

    if (file) {
      file.classes.push({
        name: c.name,
        range: def.range,
      })
    } else {
      files.push({
        uri: def.uri,
        classes: [
          {
            name: c.name,
            range: def.range,
          },
        ],
      })
    }
  }

  return files
}
