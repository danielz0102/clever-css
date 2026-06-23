import * as vscode from "vscode"

import type { CSSClassRepository } from "../../domain/css-class-repository"

export class DeleteClientFile {
  constructor(private _classes: CSSClassRepository) {}

  async execute(_uri: vscode.Uri): Promise<void> {
    throw new Error("Not implemented yet.")
  }
}
