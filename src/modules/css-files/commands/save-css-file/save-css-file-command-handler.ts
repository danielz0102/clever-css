import type { CssClassIndex } from "../../../../persistence/class-index"
import { type CssClassParser } from "../../adapters/css-parser"
import type { CssFileDto } from "../../dtos/css-file-dto"

export class SaveCssFile {
  constructor(
    private index: CssClassIndex,
    private parseSymbols: CssClassParser
  ) {}

  async execute(file: CssFileDto): Promise<void> {
    const symbols = await this.parseSymbols(file.content)
    const foundClasses = symbols.map((c) => c.className)

    Array.from(this.index.entries())
      .filter(([_, record]) => record.definitions.some((def) => def.uri === file.uri))
      .filter(([className]) => !foundClasses.includes(className))
      .forEach(([_, record]) => {
        record.definitions = record.definitions.filter((def) => def.uri !== file.uri)
      })
  }
}
