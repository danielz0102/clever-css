import { CssClass } from "../../../../domain/css-class"
import type { CssClassRepository } from "../../../../domain/css-class-repository"
import type { Location } from "../../../../domain/location"
import { type CssClassParser } from "../../adapters/css-parser"
import type { CssFileDto } from "../../dtos/css-file-dto"

export class LoadDefinitions {
  constructor(
    private classes: CssClassRepository,
    private findCssFiles: () => Promise<CssFileDto[]>,
    private parseSymbols: CssClassParser
  ) {}

  async execute(): Promise<void> {
    await this.classes.destroy()

    const files = await this.findCssFiles()
    const symbols = (await Promise.all(files.map(this.parseFile))).flat()

    for (const { className, location, uri } of symbols) {
      const newDefinition: Location = {
        uri,
        start: location.start,
        end: location.end,
      }
      const cssClass = await this.classes.findOne(className)

      if (!cssClass) {
        await this.classes.save(new CssClass(className, newDefinition))
        continue
      }

      cssClass.definitions.add(newDefinition)
      await this.classes.save(cssClass)
    }
  }

  private parseFile = async (file: CssFileDto) => {
    const symbols = await this.parseSymbols(file.content)
    return symbols.map((c) => ({ ...c, ...file }))
  }
}
