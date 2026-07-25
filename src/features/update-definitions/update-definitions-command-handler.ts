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
    const { removeNonExistent } = this.resetDefinitions(file)
    const symbols = await this.parseSymbols(file)

    for (const { name: className, location } of symbols) {
      const cssClass = this.classes.findOne(className) ?? new CssClass(className)
      cssClass.definitions.add(location)
      this.classes.save(cssClass)
    }

    removeNonExistent()
  }

  private resetDefinitions(file: CssFileDto): { removeNonExistent: () => void } {
    const classes = this.classes.getFromDefinitionUri(file.uri)

    for (const cssClass of classes) {
      cssClass.definitions.removeFromUri(file.uri)
      this.classes.save(cssClass)
    }

    const removeNonExistent = () => {
      for (const cssClass of classes) {
        const classFound = this.classes.findOne(cssClass.className)

        if (classFound && !classFound.exists) {
          this.classes.delete(cssClass)
        }
      }
    }

    return { removeNonExistent }
  }
}
