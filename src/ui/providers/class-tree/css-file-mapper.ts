import * as vscode from "vscode"

import type { CssClassModel } from "../../../persistence/css-class-index"

type CssClass = {
  name: string
  range: vscode.Range
}

export type CssFile = {
  uri: vscode.Uri
  classes: CssClass[]
}

export type FilesIndex = Map<string, CssFile>

export function mapCssFiles(models: CssClassModel[]): FilesIndex {
  const index: FilesIndex = new Map()

  models.forEach((model) => {
    model.definitions.forEach((def) => {
      const uri = vscode.Uri.parse(def.uri)
      const key = uri.toString()

      let file = index.get(key)

      if (!file) {
        file = { uri, classes: [] }
        index.set(key, file)
      }

      file.classes.push({
        name: model.className,
        range: new vscode.Range(def.start.line, def.start.column, def.end.line, def.end.column),
      })
    })
  })

  return index
}
