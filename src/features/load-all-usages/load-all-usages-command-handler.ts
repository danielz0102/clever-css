import type { ClientFileParser } from "../../adapters/client-file-parsers/client-file-parser-port"
import type { CssClassIndex } from "../../adapters/css-class-index"
import { CssClass } from "../../domain/css-class"
import type { Symbol } from "../../dtos/symbol-dto"
import type { ClientFilesFinder } from "./find-client-files-adapter"

export class LoadAllUsages {
  constructor(
    private classes: CssClassIndex,
    private parser: ClientFileParser,
    private findFiles: ClientFilesFinder
  ) {}

  async execute(): Promise<void> {
    await this.classes.resetAllUsages()
    const files = await this.findFiles()

    for (const uri of files) {
      await this.saveUsages(this.parser.getUsagesFrom(uri), uri)
    }
  }

  private async saveUsages(usages: Symbol[], uri: string): Promise<void> {
    for (const { className: name, location } of usages) {
      const cssClass = (await this.classes.findOne(name)) ?? new CssClass(name)
      cssClass.usages.add({ uri, start: location.start, end: location.end })
      await this.classes.save(cssClass)
    }
  }
}
