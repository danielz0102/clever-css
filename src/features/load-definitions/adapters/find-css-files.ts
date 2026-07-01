import * as vscode from "vscode"

import type { CssFileDto } from "../../../modules/css-files/dtos/css-file-dto"
import { UriMapper } from "../../../modules/css-files/mappers/uri-mapper"

export async function findCssFiles(): Promise<CssFileDto[]> {
  const uris = await vscode.workspace.findFiles("**/*.css", "**/{node_modules,dist,build}/**")
  const files = await Promise.all(uris.map(async (u) => UriMapper.toCssFileDto(u)))
  return files
}
