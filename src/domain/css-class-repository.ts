import * as vscode from "vscode"

import { CSSClass } from "./css-class"

export class CSSClassRepository {
  private classes = new Map<string, CSSClass>()

  add(className: string, definition: vscode.Location): void {
    if (this.classes.has(className)) {
      this.classes.get(className)!.addDefinition(definition)
      return
    }

    this.classes.set(className, new CSSClass(className, definition))
  }

  has(className: string): boolean {
    return this.classes.has(className)
  }

  delete(className: string): void {
    this.classes.delete(className)
  }

  deleteFromFile(uri: vscode.Uri): void {
    this.classes.forEach((v, k) => {
      v.removeDefinitionsFromFile(uri)

      if (v.definitions.length === 0) {
        this.classes.delete(k)
      }
    })
  }

  getAll(): CSSClass[] {
    return Array.from(this.classes.values())
  }
}
