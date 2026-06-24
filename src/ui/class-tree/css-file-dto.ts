import * as vscode from "vscode"

import type { CSSClassRecord } from "../../persistence/class-index"

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
  fromPersistence(classes: CSSClassRecord[]): CSSFile[] {
    const files: CSSFile[] = []

    for (const c of classes) {
      const def = c.definitions[0]

      if (!def) {
        throw new Error(`CSS class ${c.className} has no definition`)
      }

      const file = files.find((f) => f.is(vscode.Uri.parse(def.uri)))

      if (file) {
        file.addClass({
          name: c.className,
          range: new vscode.Range(def.start.line, def.start.column, def.end.line, def.end.column),
        })
      } else {
        files.push(
          new CSSFile(vscode.Uri.parse(def.uri), {
            name: c.className,
            range: new vscode.Range(def.start.line, def.start.column, def.end.line, def.end.column),
          })
        )
      }
    }

    return files
  },
}
