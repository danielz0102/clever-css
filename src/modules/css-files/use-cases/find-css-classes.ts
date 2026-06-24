import * as vscode from "vscode"

import { CSSClassRepository } from "../../../domain/css-class-repository"
import type { CSSClassIndex } from "../../../persistence/class-index"
import { parseCSSClassSymbols } from "../css-parser"
import type { CSSFileDTO } from "../dtos/css-file"
import { readCSSFileUri } from "../lib/read-css-uri"

export async function findCSSClasses(): Promise<CSSClassRepository> {
  const classes = new CSSClassRepository()
  const uris = await vscode.workspace.findFiles("**/*.css", "**/{node_modules,dist,build}/**")
  const symbols = (await Promise.all(uris.map(readCSSFileUri))).flat()

  symbols.forEach((c) => classes.add(c.className, c.location))

  return classes
}

export class LoadDefinitions {
  constructor(private index: CSSClassIndex) {}

  async execute(files: CSSFileDTO[]): Promise<void> {
    const symbols = (
      await Promise.all(
        files.map(async (file: CSSFileDTO) => {
          const classes = await parseCSSClassSymbols(file.content)
          return classes.map((c) => ({ ...c, ...file }))
        })
      )
    ).flat()

    symbols.forEach(({ className, location, uri }) => {
      const record = this.index.get(className)

      if (record) {
        record.definitions.push({
          uri,
          start: location.start,
          end: location.end,
        })
      } else {
        this.index.set(className, {
          className: className,
          definitions: [
            {
              uri,
              start: location.start,
              end: location.end,
            },
          ],
          usages: [],
        })
      }
    })
  }
}
