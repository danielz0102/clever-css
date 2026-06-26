import type { CSSClassIndex } from "../../../../persistence/class-index"
import { parseCSSClassSymbols } from "../../adapters/css-parser"
import type { CssFileDto } from "../../dtos/css-file-dto"

export class SaveCSSFile {
  constructor(private index: CSSClassIndex) {}

  async execute(file: CssFileDto): Promise<void> {
    const symbols = await parseCSSClassSymbols(file.content)
    const foundClasses = symbols.map((c) => c.className)

    Array.from(this.index.entries())
      .filter(([_, record]) => record.definitions.some((def) => def.uri === file.uri))
      .filter(([className]) => !foundClasses.includes(className))
      .forEach(([_, record]) => {
        record.definitions = record.definitions.filter((def) => def.uri !== file.uri)
      })
  }
}
