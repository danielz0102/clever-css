import type { CSSClassIndex } from "../../../../persistence/class-index"
import type { CSSFileDTO } from "../../dtos/css-file-dto"
import { parseCSSClassSymbols } from "../../parsers/css-parser"

export class SaveCSSFile {
  constructor(private index: CSSClassIndex) {}

  async execute(file: CSSFileDTO): Promise<void> {
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
