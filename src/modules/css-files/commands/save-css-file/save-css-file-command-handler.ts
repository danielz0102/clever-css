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

    Array.from(this.index.entries())
      .filter(([_, record]) => record.definitions.some((d) => d.uri === file.uri))
      .forEach(([_, record]) => {
        record.definitions = record.definitions.filter((d) => d.uri !== file.uri)

        if (record.definitions.length === 0) {
          this.index.delete(record.className)
        }
      })

    symbols.forEach(({ className, location }) => {
      const record = this.index.get(className)

      if (record) {
        record.definitions.push({
          uri: file.uri,
          start: location.start,
          end: location.end,
        })
      } else {
        this.index.set(className, {
          className,
          definitions: [
            {
              uri: file.uri,
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
