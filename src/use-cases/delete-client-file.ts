import * as vscode from "vscode"

import type { CSSClassRepository } from "../domain/css-class-repository"

export async function deleteClientFile(
  _classes: CSSClassRepository,
  _uri: vscode.Uri
): Promise<void> {
  throw new Error("Not implemented yet.")
}
