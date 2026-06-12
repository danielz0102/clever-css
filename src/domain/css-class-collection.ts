import * as vscode from "vscode"

import { CSSClass } from "./css-class"

export class CSSClassCollection {
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

  getAll(): CSSClass[] {
    return Array.from(this.classes.values())
  }
}
