import * as vscode from "vscode"

export class CSSClass {
  #definitions: vscode.Location[] = []
  #usages?: vscode.Location[] = undefined

  constructor(
    readonly name: string,
    definition: vscode.Location
  ) {
    this.#definitions.push(definition)
  }

  addDefinition(definition: vscode.Location): void {
    this.#definitions.push(definition)
  }

  addUsage(usage: vscode.Location): void {
    this.#usages ??= []
    this.#usages.push(usage)
  }

  get definitions(): readonly vscode.Location[] {
    return this.#definitions
  }

  get usages(): readonly vscode.Location[] {
    return this.#usages ?? []
  }
}
