import type { CssClassIndex } from "../../adapters/css-class-index"
import { type CssClassParser } from "../../adapters/css-parser"
import { CssClass } from "../../domain/css-class"
import type { CssFileDto } from "../../dtos/css-file-dto"

export class LoadDefinitions {
  constructor(
    private classes: CssClassIndex,
    private findCssFiles: () => Promise<CssFileDto[]>,
    private parseSymbols: CssClassParser
  ) {}

  async execute(): Promise<void> {
    await this.classes.destroy()

    const files = await this.findCssFiles()
    const symbols = (await Promise.all(files.map(this.parseSymbols))).flat()

    for (const { className, location } of symbols) {
      const cssClass = (await this.classes.findOne(className)) ?? new CssClass(className)
      cssClass.definitions.add(location)
      await this.classes.save(cssClass)
    }
  }
}
