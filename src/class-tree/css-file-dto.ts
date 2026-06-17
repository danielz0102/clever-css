import type * as vscode from "vscode"

import type { CSSClass } from "../domain/css-class"

export class CSSFile {
  #classes: CSSFileClass[] = []

  constructor(
    readonly uri: vscode.Uri,
    ...classes: CSSFileClass[]
  ) {
    this.#classes.push(...classes)
  }

  get classes(): readonly CSSFileClass[] {
    return this.#classes
  }

  addClass(cssClass: CSSFileClass): void {
    this.#classes.push(cssClass)
  }

  is(uri: vscode.Uri): boolean {
    return this.uri.toString() === uri.toString()
  }
}

type CSSFileClass = {
  name: string
  range: vscode.Range
}

export const CSSFileMapper = {
  fromEntities(classes: CSSClass[]): CSSFile[] {
    const files: CSSFile[] = []

    for (const c of classes) {
      const def = c.firstDefinition
      const file = files.find((f) => f.is(def.uri))

      if (file) {
        file.addClass({ name: c.name, range: def.range })
      } else {
        files.push(new CSSFile(def.uri, { name: c.name, range: def.range }))
      }
    }

    return files
  },
}
