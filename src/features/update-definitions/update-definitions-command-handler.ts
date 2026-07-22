import type { CssClassRepository } from "../../adapters/css-class-repository"
import type { CssClassParser } from "../../adapters/css-parser"
import { CssClass } from "../../domain/css-class"
import type { CssFileDto } from "../../dtos/css-file-dto"

export class UpdateDefinitions {
  constructor(
    private classes: CssClassRepository,
    private parseSymbols: CssClassParser
  ) {}

  async from(file: CssFileDto): Promise<void> {
    const { removeNonExistent } = await this.resetDefinitions(file)
    const symbols = await this.parseSymbols(file)

    for (const { name: className, location } of symbols) {
      const cssClass = (await this.classes.findOne(className)) ?? new CssClass(className)
      cssClass.definitions.add(location)
      await this.classes.save(cssClass)
    }

    await removeNonExistent()
  }

  private async resetDefinitions(
    file: CssFileDto
  ): Promise<{ removeNonExistent: () => Promise<void> }> {
    const classes = await this.classes.getFromDefinitionUri(file.uri)

    for (const cssClass of classes) {
      cssClass.definitions.removeFromUri(file.uri)
      await this.classes.save(cssClass)
    }

    const removeNonExistent = async () => {
      for (const cssClass of classes) {
        const classFound = await this.classes.findOne(cssClass.className)

        if (classFound && !classFound.exists) {
          await this.classes.delete(cssClass)
        }
      }
    }

    return { removeNonExistent }
  }
}
