import type { CSSClassIndex } from "../../../persistence/class-index"
import { parseCSSClassSymbols } from "../css-parser"
import type { CSSFileDTO } from "../dtos/css-file"

export class SaveCSSFile {
  constructor(private index: CSSClassIndex) {}

  async execute(file: CSSFileDTO): Promise<void> {
    const symbols = await parseCSSClassSymbols(file.content)
    const foundClasses = symbols.map((c) => c.className)

    for (const [className, data] of this.index.entries()) {
      if (
        data.definitions.some((def) => def.uri === file.uri) &&
        !foundClasses.includes(className)
      ) {
        data.definitions = data.definitions.filter((def) => def.uri !== file.uri)
      }
    }
  }
}
