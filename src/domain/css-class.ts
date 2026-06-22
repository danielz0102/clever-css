import * as vscode from "vscode"

export class CSSClass {
  #definitions: vscode.Location[] = []
  #usages: vscode.Location[] = []

  constructor(
    readonly name: string,
    definition: vscode.Location
  ) {
    this.#definitions.push(definition)
  }

  addDefinition(definition: vscode.Location): void {
    this.#definitions.push(definition)
  }

  removeDefinitionsFromFile(uri: vscode.Uri): void {
    this.#definitions = this.#definitions.filter((d) => d.uri.toString() !== uri.toString())
  }

  addUsage(usage: vscode.Location): void {
    this.#usages.push(usage)
  }

  hasUsage(uri: vscode.Uri): boolean {
    return this.#usages?.some((u) => u.uri.toString() === uri.toString()) ?? false
  }

  removeUsage(uri: vscode.Uri): void {
    if (!this.#usages) {
      return
    }

    this.#usages = this.#usages.filter((u) => u.uri.toString() !== uri.toString())
  }

  getReferences(): vscode.Location[] {
    return [...this.#definitions, ...this.#usages]
  }

  get firstDefinition(): vscode.Location {
    const def = this.#definitions[0]

    if (!def) {
      throw new Error(`CSS class ${this.name} has no definitions.`)
    }

    return def
  }

  get definitions(): readonly vscode.Location[] {
    return this.#definitions
  }

  get usages(): readonly vscode.Location[] {
    return this.#usages ?? []
  }

  get usagesAreLoaded(): boolean {
    return this.#usages !== undefined
  }
}
