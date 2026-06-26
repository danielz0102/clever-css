import type { CssClassIndex } from "../../../../persistence/class-index"
import { type CssClassParser } from "../../adapters/css-parser"
import type { CssFileDto } from "../../dtos/css-file-dto"

export class LoadDefinitions {
  constructor(
    private index: CssClassIndex,
    private findCssFiles: () => Promise<CssFileDto[]>,
    private parseSymbols: CssClassParser
  ) {}

  async execute(): Promise<void> {
    const files = await this.findCssFiles()

    const symbols = (
      await Promise.all(
        files.map(async (file) => {
          const symbols = await this.parseSymbols(file.content)
          return symbols.map((c) => ({ ...c, ...file }))
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
