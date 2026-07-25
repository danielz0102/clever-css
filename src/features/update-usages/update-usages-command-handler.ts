import type { CssClassRepository } from "../../adapters/css-class-repository"
import type { CssFileDto } from "../../dtos/css-file-dto"
import type { Token } from "../../dtos/token-dto"

export class UpdateUsages {
  constructor(
    private classes: CssClassRepository,
    private parseUsagesFrom: (file: CssFileDto) => Token[]
  ) {}

  from(file: CssFileDto): void {
    this.resetUsages(file.uri)
    this.saveUsages(this.parseUsagesFrom(file))
  }

  private resetUsages(uri: string): void {
    const classes = this.classes.getFromUsageUri(uri)

    for (const cssClass of classes) {
      cssClass.usages.removeFromUri(uri)
      this.classes.save(cssClass)
    }
  }

  private saveUsages(usages: Token[]): void {
    for (const { name, location } of usages) {
      const cssClass = this.classes.findOne(name)
      if (!cssClass) continue

      cssClass.usages.add(location)
      this.classes.save(cssClass)
    }
  }
}
