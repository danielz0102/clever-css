import type { ClientFileParser } from "../../adapters/client-file-parsers/client-file-parser-port"
import type { CssClassRepository } from "../../adapters/css-class-repository"
import type { Token } from "../../dtos/token-dto"

export class UpdateUsages {
  constructor(
    private classes: CssClassRepository,
    private parser: ClientFileParser
  ) {}

  async from(uri: string): Promise<void> {
    await this.resetUsages(uri)
    await this.saveUsages(this.parser.getUsagesFrom(uri))
  }

  private async resetUsages(uri: string): Promise<void> {
    const classes = await this.classes.getFromUsageUri(uri)

    for (const cssClass of classes) {
      cssClass.usages.removeFromUri(uri)
      await this.classes.save(cssClass)
    }
  }

  private async saveUsages(usages: Token[]): Promise<void> {
    for (const { name, location } of usages) {
      const cssClass = await this.classes.findOne(name)
      if (!cssClass) continue

      cssClass.usages.add(location)
      await this.classes.save(cssClass)
    }
  }
}
