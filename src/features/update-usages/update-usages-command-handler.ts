import type { ClientFileParser } from "../../adapters/client-file-parsers/client-file-parser-port"
import type { CssClassRepository } from "../../adapters/css-class-repository"
import type { Token } from "../../dtos/token-dto"

export class UpdateUsages {
  constructor(
    private classes: CssClassRepository,
    private parser: ClientFileParser
  ) {}

  from(uri: string): void {
    this.resetUsages(uri)
    this.saveUsages(this.parser.parseUsagesFrom(uri))
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
