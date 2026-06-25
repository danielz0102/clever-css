import * as vscode from "vscode"

import { UriMapper } from "../../../../../ui/mappers/uri-mapper"
import type { CSSFileDto } from "../../../dtos/css-file-dto"

export async function findCSSFiles(): Promise<CSSFileDto[]> {
  const uris = await vscode.workspace.findFiles("**/*.css", "**/{node_modules,dist,build}/**")
  const files = await Promise.all(uris.map(async (u) => UriMapper.toCssFileDto(u)))
  return files
}
