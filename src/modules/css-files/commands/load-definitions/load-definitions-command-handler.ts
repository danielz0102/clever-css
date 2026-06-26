import type { CssClassIndex } from "../../../../persistence/class-index"
import { parseCssClassSymbols } from "../../adapters/css-parser"
import type { CssFileDto } from "../../dtos/css-file-dto"

export class LoadDefinitions {
  constructor(
    private index: CssClassIndex,
    private findAllCssFiles: () => Promise<CssFileDto[]>
  ) {}

  async execute(): Promise<void> {
    const files = await this.findAllCssFiles()

    const symbols = (
      await Promise.all(
        files.map(async (file: CssFileDto) => {
          const classes = await parseCssClassSymbols(file.content)
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
