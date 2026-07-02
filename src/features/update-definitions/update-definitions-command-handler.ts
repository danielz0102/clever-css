import type { CssClassIndex } from "../../adapters/css-class-index"
import type { CssClassParser } from "../../adapters/css-parser"
import { CssClass } from "../../domain/css-class"
import type { CssFileDto } from "../../dtos/css-file-dto"

export class UpdateDefinitions {
  constructor(
    private classes: CssClassIndex,
    private parseSymbols: CssClassParser
  ) {}

  async execute(file: CssFileDto): Promise<void> {
    await this.resetDefinitions(file)
    const symbols = await this.parseSymbols(file)

    for (const { name: className, location } of symbols) {
      const cssClass = (await this.classes.findOne(className)) ?? new CssClass(className)
      cssClass.definitions.add(location)
      await this.classes.save(cssClass)
    }
  }

  private async resetDefinitions(file: CssFileDto) {
    const classes = await this.classes.getFromDefinitionUri(file.uri)

    for (const cssClass of classes) {
      cssClass.definitions.removeFromUri(file.uri)

      if (!cssClass.exists) {
        await this.classes.delete(cssClass)
      } else {
        await this.classes.save(cssClass)
      }
    }
  }
}
