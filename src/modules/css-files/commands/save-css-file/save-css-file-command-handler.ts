import { CssClass } from "../../../../domain/css-class"
import type { CssClassRepository } from "../../../../domain/css-class-repository"
import { type CssClassParser } from "../../adapters/css-parser"
import type { CssFileDto } from "../../dtos/css-file-dto"

export class SaveCssFile {
  constructor(
    private classes: CssClassRepository,
    private parseSymbols: CssClassParser
  ) {}

  async execute(file: CssFileDto): Promise<void> {
    await this.resetDefinitions(file)

    const symbols = await this.parseSymbols(file.content)

    for (const { className, location } of symbols) {
      const cssClass = (await this.classes.findOne(className)) ?? new CssClass(className)
      cssClass.definitions.add({
        uri: file.uri,
        start: location.start,
        end: location.end,
      })
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
