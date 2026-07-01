import * as vscode from "vscode"

import { uriToCssFileDto, type CssFileDto } from "../../dtos/css-file-dto"

export async function findCssFiles(): Promise<CssFileDto[]> {
  const uris = await vscode.workspace.findFiles("**/*.css", "**/{node_modules,dist,build}/**")
  const files = await Promise.all(uris.map(async (u) => uriToCssFileDto(u.toString())))
  return files
}
