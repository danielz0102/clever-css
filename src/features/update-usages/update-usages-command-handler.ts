import type {
  ClientFileParser,
  UsageSymbol,
} from "../../adapters/client-file-parsers/client-file-parser-port"
import type { CssClassIndex } from "../../adapters/css-class-index"
import { CssClass } from "../../domain/css-class"

export class UpdateUsages {
  constructor(
    private classes: CssClassIndex,
    private parser: ClientFileParser
  ) {}

  async execute(uri: string): Promise<void> {
    await this.resetUsages(uri)
    await this.saveUsages(this.parser.getUsagesFrom(uri), uri)
  }

  private async resetUsages(uri: string): Promise<void> {
    const classes = await this.classes.getFromUsageUri(uri)

    for (const cssClass of classes) {
      cssClass.usages.removeFromUri(uri)
      await this.classes.save(cssClass)
    }
  }

  private async saveUsages(usages: UsageSymbol[], uri: string): Promise<void> {
    for (const { className: name, location } of usages) {
      const cssClass = (await this.classes.findOne(name)) ?? new CssClass(name)
      cssClass.usages.add({ uri, start: location.start, end: location.end })
      await this.classes.save(cssClass)
    }
  }
}
